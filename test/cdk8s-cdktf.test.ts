import {
  KubernetesProvider,
  Namespace,
} from '@cdktf/provider-kubernetes';
import { Chart, ChartProps } from 'cdk8s';
import { Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
import { Construct } from 'constructs';
import matchers from 'expect/build/matchers';
import { MatcherState, ExpectationResult } from 'expect/build/types';
import { JSONPath } from 'jsonpath-plus';
import { Cdk8s } from '../src';
import {
  DeploymentSpec,
  KubeDeployment,
  KubeNamespace,
  KubeService,
  ServicePort,
} from './imports/k8s';

Testing.setupJest();

function parseJson(
  this: MatcherState,
  received: unknown,
  expected?: any,
  fn?: (json: any, expected?: any) => ExpectationResult,
): ExpectationResult {
  const { printReceived, EXPECTED_COLOR } = this.utils;
  if (typeof received !== 'string') {
    return {
      pass: false,
      message: () => [
        'expected',
        printReceived(received),
        'to be JSON, but it is not a',
        EXPECTED_COLOR('JSON string'),
      ].join(' '),
    };
  }

  try {
    const json = JSON.parse(received);
    return fn ? fn(json, expected)
      : {
        pass: true,
        message: () => [
          'expected',
          printReceived(received),
          'not to be JSON, but it is a',
          EXPECTED_COLOR('JSON string'),
        ].join(' '),
      };
  } catch (error) {
    return {
      pass: false,
      message: () => [
        'expected',
        printReceived(received),
        'to be JSON, but it is not a',
        EXPECTED_COLOR('valid JSON string'),
      ].join(' '),
    };
  }
}

function toBeJson(this: MatcherState, received: unknown): ExpectationResult {
  return parseJson.call(this, received);
}

function toEqualJson(this: MatcherState, received: unknown, expected: any): ExpectationResult {
  return parseJson.call(
    this,
    received,
    expected,
    (json, exp) => matchers.toEqual.call(this, json, exp),
  );
}

function toMatchJson(this: MatcherState, received: unknown, expected: any): ExpectationResult {
  return parseJson.call(
    this,
    received,
    expected,
    (json, exp) => matchers.toMatchObject.call(this, json, exp),
  );
}

function toMatchJsonPath(this: MatcherState, received: unknown, path: string, expected: any): ExpectationResult {
  return parseJson.call(
    this,
    received,
    expected,
    (json, exp) => {
      let actual = JSONPath({ json: json, path, wrap: false });
      return matchers.toMatchObject.call(this, actual, exp);
    },
  );
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeJson(expected: any): R;
      toEqualJson(expected: any): R;
      toMatchJson(expected: any): R;
      toMatchJsonPath(path: string, expected: any): R;
    }
    interface Expect {
      jsonContaining<E = {}>(b: E): any;
    }
    interface InverseAsymmetricMatchers { }
  }
}

expect.extend({
  toBeJson,
  toEqualJson,
  toMatchJson,
  toMatchJsonPath,
  jsonMatching(received, expected) {
    let pass = false;
    try {
      received = JSON.parse(received);
      pass = this.equals(received, expected);
    } catch (err) { } // eslint-disable-line no-empty
    return { pass, message: () => '' };
  },
  toMatchJsonPath2(received, expected: object, pathExpression: string) {
    const matcherName = 'toMatchJsonPath';
    const labelExpected = 'Expected:';
    const labelReceived = 'Reveived:';
    const { isNot, promise, equals } = this;
    const { getLabelPrinter, matcherHint, printExpected, printReceived, printDiffOrStringify } = this.utils;
    const printLabel = getLabelPrinter(labelExpected, labelReceived);
    const json = JSON.parse(received);
    // console.log(JSON.stringify(json, undefined, 2));
    let actual = JSONPath({ json: received, path: pathExpression, wrap: false });
    console.log(JSON.stringify(actual, undefined, 2));
    const pass = equals(actual, expected);

    const passMessage = [
      matcherHint(matcherName, undefined, undefined, { isNot, promise }),
      '\n\n',
      printLabel(labelExpected),
      isNot ? 'not' : '',
      printExpected(expected),
      '\n',
      printLabel(labelReceived),
      isNot ? 'not' : '',
      printReceived(json),
    ].join();

    const failMessage = [
      matcherHint(matcherName, undefined, undefined, { isNot, promise }),
      '\n\n',
      printDiffOrStringify(
        JSON.stringify(expected, undefined, 2),
        JSON.stringify(actual, undefined, 2),
        'Expected',
        'Received',
        this.expand,
      ),
    ].join();

    const message = pass ? () => passMessage : () => failMessage;

    return { actual: received, expected, message, pass, name: matcherName };
  },
});

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

const svcName = 'svc';
const svcPorts: Array<ServicePort> = [{ port: port }];

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
    ).toMatchInlineSnapshot(`
"{
}"
`);
  });

  test('transform one ApiObject', () => {
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
    ).toMatchJsonPath('$..manifest', [{
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'cdk8s-cdktf-deploy-c806be9c',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'test',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'test',
            },
          },
          spec: {
            containers: [
              {
                image: 'paulbouwer/hello-kubernetes:1.7',
                name: 'hello-kubernetes',
                ports: [
                  {
                    containerPort: 8080,
                  },
                ],
              },
            ],
          },
        },
      },
    }]);
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
    ).toMatchInlineSnapshot(`
"{
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deploy-c806be9c_AA8898E9\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-deploy-c806be9c\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-v1-Namespace-my-namespace_5E2F85DE\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"v1\\",
          \\"kind\\": \\"Namespace\\",
          \\"metadata\\": {
            \\"name\\": \\"my-namespace\\"
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-v1-Service-cdk8s-cdktf-svc-c83d273d_2A26E18E\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"v1\\",
          \\"kind\\": \\"Service\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-svc-c83d273d\\"
          },
          \\"spec\\": {
            \\"ports\\": [
              {
                \\"port\\": 8080
              }
            ],
            \\"selector\\": {
              \\"app\\": \\"test\\"
            }
          }
        }
      }
    }
  }
}"
`);
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
    ).toMatchInlineSnapshot(`
"{
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deploy-c806be9c-my-namespace_81BAEF7E\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-deploy-c806be9c\\",
            \\"namespace\\": \\"my-namespace\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-v1-Namespace-my-namespace_5E2F85DE\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"v1\\",
          \\"kind\\": \\"Namespace\\",
          \\"metadata\\": {
            \\"name\\": \\"my-namespace\\"
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-v1-Service-cdk8s-cdktf-svc-c83d273d-my-namespace_2F1088D9\\": {
        \\"depends_on\\": [
          \\"kubernetes_manifest.cdk8s-cdktf_cdk8s-cdktf-v1-Namespace-my-namespace_5E2F85DE\\",
          \\"kubernetes_manifest.cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deploy-c806be9c-my-namespace_81BAEF7E\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"v1\\",
          \\"kind\\": \\"Service\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-svc-c83d273d\\",
            \\"namespace\\": \\"my-namespace\\"
          },
          \\"spec\\": {
            \\"ports\\": [
              {
                \\"port\\": 8080
              }
            ],
            \\"selector\\": {
              \\"app\\": \\"test\\"
            }
          }
        }
      }
    }
  }
}"
`);
  });

  test('transform ApiObjects dependen cdktf resource', () => {
    expect(
      Testing.synthScope((stack) => {
        const ns = new Namespace(stack, 'namespace', {
          metadata: { name: namespaceName },
        });


        new Cdk8s(
          stack,
          chartName,
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              const deploy = new KubeDeployment(this, 'deployment', {
                metadata: { namespace: nsName },
                spec: deploymentSpec,
              });


              const deploy2 = new KubeDeployment(this, 'deployment2', {
                metadata: { namespace: nsName },
                spec: deploymentSpec,
              });


              deploy2.addDependency(deploy);
            }
          },


          { manifestOptions: { dependsOn: [ns] } });


        new KubernetesProvider(stack, 'kuberneter-provider');
      })).
      toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
  },
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deployment-c858d2ef-ns_59BD8828\\": {
        \\"depends_on\\": [
          \\"kubernetes_namespace.namespace\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-deployment-c858d2ef\\",
            \\"namespace\\": \\"ns\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deployment2-c8ffa5fd-ns_8492722A\\": {
        \\"depends_on\\": [
          \\"kubernetes_manifest.cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deployment-c858d2ef-ns_59BD8828\\",
          \\"kubernetes_namespace.namespace\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-deployment2-c8ffa5fd\\",
            \\"namespace\\": \\"ns\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    },
    \\"kubernetes_namespace\\": {
      \\"namespace\\": {
        \\"metadata\\": {
          \\"name\\": \\"my-namespace\\"
        }
      }
    }
  },
  \\"terraform\\": {
    \\"required_providers\\": {
      \\"kubernetes\\": {
        \\"source\\": \\"kubernetes\\",
        \\"version\\": \\"2.12.1\\"
      }
    }
  }
}"
`);
  });

  test('Transform Chart with custom options', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s<TestChartProps>(stack, 'cdk8s-cdktf', TestChart, {
          chartOptions: {
            name: containerName,
            image: imageName,
            port: port,
          },
        });


        new KubernetesProvider(stack, 'kuberneter-provider');
      })).
      toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
  },
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-deploy-c806be9c_AA8898E9\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-deploy-c806be9c\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  \\"terraform\\": {
    \\"required_providers\\": {
      \\"kubernetes\\": {
        \\"source\\": \\"kubernetes\\",
        \\"version\\": \\"2.12.1\\"
      }
    }
  }
}"
`);
  });

  test('Transform Chart with custom Construct', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          'cdk8s-cdktf',
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              new TestConstruct(this, 'test-construct');
            }
          });


      })).
      toMatchInlineSnapshot(`
"{
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-cdktf_cdk8s-cdktf-apps--v1-Deployment-cdk8s-cdktf-test-construct-deploy-c8ae5674-my-namespace_033695B6\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-cdktf-test-construct-deploy-c8ae5674\\",
            \\"namespace\\": \\"my-namespace\\"
          },
          \\"spec\\": {
            \\"replicas\\": 1,
            \\"selector\\": {
              \\"matchLabels\\": {
                \\"app\\": \\"test\\"
              }
            },
            \\"template\\": {
              \\"metadata\\": {
                \\"labels\\": {
                  \\"app\\": \\"test\\"
                }
              },
              \\"spec\\": {
                \\"containers\\": [
                  {
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.7\\",
                    \\"name\\": \\"hello-kubernetes\\",
                    \\"ports\\": [
                      {
                        \\"containerPort\\": 8080
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      \\"cdk8s-cdktf_cdk8s-cdktf-v1-Namespace-my-namespace_5E2F85DE\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"v1\\",
          \\"kind\\": \\"Namespace\\",
          \\"metadata\\": {
            \\"name\\": \\"my-namespace\\"
          }
        }
      }
    }
  }
}"
`);
  });
});
