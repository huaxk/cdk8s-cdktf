import { Namespace } from '@cdktf/provider-kubernetes';
import { Chart, ChartProps } from 'cdk8s';
import { Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
import { Construct } from 'constructs';
import 'jest-json-extend';
import { Cdk8s } from '../src';
import {
  DeploymentSpec,
  KubeDeployment,
  KubeNamespace,
  KubeService,
  ServicePort,
} from './imports/k8s';

Testing.setupJest();

const chartName = 'cdk8s-cdktf';
const nsName = 'ns';
const namespaceName = 'my-namespace';

const label = { app: 'test' };
const containerName = 'hello-kubernetes';
const imageName = 'paulbouwer/hello-kubernetes:1.7';
const port = 8080;
const deployName = 'deploy';
const deploymentSpec: DeploymentSpec = {
  replicas: 1,
  selector: { matchLabels: label },

  template: {
    metadata: { labels: label },
    spec: {
      containers: [
        {
          name: containerName,
          image: imageName,
          ports: [{ containerPort: port }],
        },
      ],
    },
  },
};

const deployGVK = { apiVersion: 'apps/v1', kind: 'Deployment' };
const nsGVK = { apiVersion: 'v1', kind: 'Namespace' };
const svcGVK = { apiVersion: 'v1', kind: 'Service' };

const svcName = 'svc';
const svcPorts: Array<ServicePort> = [{ port: port }];

describe('Transform cdk8s chart to cdktf manifest', () => {
  test('transform empty Chart', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);
            }
          },
        );
      }),
    ).toEqualJSON({});
  });

  test('transform one ApiObject', () => {
    const expectedDeployName = `${chartName}-${deployName}`;
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              new KubeDeployment(this, deployName, { spec: deploymentSpec });
            }
          },
        );
      }),
    ).toEqualJSON(
      [
        {
          depends_on: [],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(expectedDeployName),
            },
            spec: deploymentSpec,
          },
        },
      ],
      '$.resource.kubernetes_manifest.*',
    );
  });

  test('transform multiple ApiObjects', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              new KubeNamespace(this, nsName, {
                metadata: { name: namespaceName },
              });

              new KubeDeployment(this, deployName, {
                spec: deploymentSpec,
              });

              new KubeService(this, svcName, {
                spec: {
                  selector: label,
                  ports: svcPorts,
                },
              });
            }
          },
        );
      }),
    ).toEqualJSON(
      expect.arrayContaining([
        {
          depends_on: [],
          manifest: {
            ...nsGVK,
            metadata: {
              name: namespaceName,
            },
          },
        },
        {
          depends_on: [],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${deployName}`),
            },
            spec: deploymentSpec,
          },
        },
        {
          depends_on: [],
          manifest: {
            ...svcGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${svcName}`),
            },
            spec: {
              selector: label,
              ports: svcPorts,
            },
          },
        },
      ]),
      '$.resource.kubernetes_manifest.*',
    );
  });

  test('transform multiple ApiObjects with dependencies', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              const ns = new KubeNamespace(this, nsName, {
                metadata: { name: namespaceName },
              });

              const deploy = new KubeDeployment(this, deployName, {
                metadata: { namespace: ns.metadata.name },
                spec: deploymentSpec,
              });

              const svc = new KubeService(this, svcName, {
                metadata: { namespace: ns.metadata.name },
                spec: {
                  selector: label,
                  ports: svcPorts,
                },
              });

              svc.addDependency(ns, deploy);
            }
          },
        );
      }),
    ).toEqualJSON(
      expect.arrayContaining([
        {
          depends_on: [],
          manifest: {
            ...nsGVK,
            metadata: {
              name: namespaceName,
            },
          },
        },
        {
          depends_on: [],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${deployName}`),
              namespace: namespaceName,
            },
            spec: deploymentSpec,
          },
        },
        {
          depends_on: expect.arrayContaining([
            expect.stringMatching(`${chartName}-v1-Namespace-${namespaceName}`),
            expect.stringMatching(
              `${chartName}-apps--v1-Deployment-${chartName}-${deployName}`,
            ),
          ]),
          manifest: {
            ...svcGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${svcName}`),
              namespace: namespaceName,
            },
            spec: {
              selector: label,
              ports: svcPorts,
            },
          },
        },
      ]),
      '$.resource.kubernetes_manifest.*',
    );
  });

  test('transform ApiObjects dependen cdktf resource', () => {
    const deploy1Name = 'deployment1';
    const deploy2Name = 'deployment2';
    expect(
      Testing.synthScope((stack) => {
        const ns = new Namespace(stack, nsName, {
          metadata: { name: namespaceName },
        });

        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              const deploy = new KubeDeployment(this, deploy1Name, {
                metadata: { namespace: namespaceName },
                spec: deploymentSpec,
              });

              const deploy2 = new KubeDeployment(this, deploy2Name, {
                metadata: { namespace: namespaceName },
                spec: deploymentSpec,
              });

              deploy2.addDependency(deploy);
            }
          },

          { manifestOptions: { dependsOn: [ns] } },
        );
      }),
    ).toEqualJSON(
      expect.arrayContaining([
        {
          metadata: {
            name: namespaceName,
          },
        },
        {
          depends_on: [`kubernetes_namespace.${nsName}`],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${deploy1Name}`),
              namespace: namespaceName,
            },
            spec: deploymentSpec,
          },
        },
        {
          depends_on: expect.arrayContaining([
            expect.stringMatching(`kubernetes_namespace.${nsName}`),
            expect.stringMatching(
              `${chartName}-apps--v1-Deployment-${chartName}-${deploy1Name}`,
            ),
          ]),
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${deploy2Name}`),
              namespace: namespaceName,
            },
            spec: deploymentSpec,
          },
        },
      ]),
      '$..*[?(@property==="kubernetes_manifest" || @property==="kubernetes_namespace")].*',
    );
  });

  test('Transform Chart with custom options', () => {
    interface TestChartProps extends ChartProps {
      name: string;
      image: string;
      port: number;
    }

    class TestChart extends Chart {
      constructor(scope: Construct, id: string, props: TestChartProps) {
        super(scope, id);

        new KubeDeployment(this, deployName, {
          spec: {
            replicas: 1,
            selector: { matchLabels: label },
            template: {
              metadata: { labels: label },
              spec: {
                containers: [
                  {
                    name: props.name,
                    image: props.image,
                    ports: [{ containerPort: props.port }],
                  },
                ],
              },
            },
          },
        });
      }
    }

    expect(
      Testing.synthScope((stack) => {
        new Cdk8s<TestChartProps>(stack, chartName, TestChart, {
          chartOptions: {
            name: containerName,
            image: imageName,
            port: port,
          },
        });
      }),
    ).toEqualJSON(
      [
        {
          depends_on: [],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(`${chartName}-${deployName}`),
            },
            spec: deploymentSpec,
          },
        },
      ],
      '$.resource.kubernetes_manifest.*',
    );
  });

  test('Transform Chart with custom Construct', () => {
    class TestConstruct extends Construct {
      constructor(scope: Construct, name: string) {
        super(scope, name);

        new KubeNamespace(this, nsName, {
          metadata: {
            name: namespaceName,
          },
        });

        new KubeDeployment(this, deployName, {
          metadata: {
            namespace: namespaceName,
          },
          spec: deploymentSpec,
        });
      }
    }

    const constructName = 'test-construct';
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              new TestConstruct(this, constructName);
            }
          },
        );
      }),
    ).toEqualJSON(
      expect.arrayContaining([
        {
          depends_on: [],
          manifest: {
            ...nsGVK,
            metadata: {
              name: namespaceName,
            },
          },
        },
        {
          depends_on: [],
          manifest: {
            ...deployGVK,
            metadata: {
              name: expect.stringMatching(
                `${chartName}-${constructName}-${deployName}`,
              ),
              namespace: namespaceName,
            },
            spec: deploymentSpec,
          },
        },
      ]),
      '$.resource.kubernetes_manifest.*',
    );
  });
});
