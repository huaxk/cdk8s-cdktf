import { KubernetesProvider, Namespace } from '@cdktf/provider-kubernetes';
import { Chart } from 'cdk8s';
import { Testing } from 'cdktf';
import { Construct } from 'constructs';
import { Cdk8s } from '../src';
import { DeploymentSpec, KubeDeployment, KubeNamespace } from './imports/k8s';
import 'cdktf/lib/testing/adapters/jest';

const nsName = 'my-namespace';
const label = { app: 'test' };
const containerName = 'hello-kubernetes';
const imageName = 'paulbouwer/hello-kubernetes:1.7';
const port = 8080;
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

describe('CDK8sCdktf', () => {
  it('Transform empty cdk8s Chart into cdktf plan', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          'cdk8s-chart',
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);
            }
          },
        );

        new KubernetesProvider(stack, 'kuberneters-provider');
      }),
    ).toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
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

  test('Transform cdk8s Chart which has one ApiObject into cdktf Manifest', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          'cdk8s-chart',
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              new KubeDeployment(this, 'deployment', {
                spec: deploymentSpec,
              });
            }
          },
        );

        new KubernetesProvider(stack, 'kuberneters-provider');
      }),
    ).toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
  },
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment-c85eb8eb_0F0FB78F\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-deployment-c85eb8eb\\"
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

  test('Transform cdk8s Chart which has multiple ApiObjects with dependencies into cdktf Manifests', () => {
    expect(
      Testing.synthScope((stack) => {
        new Cdk8s(
          stack,
          'cdk8s-chart',
          class extends Chart {
            constructor(scope: Construct, id: string) {
              super(scope, id);

              const deploy = new KubeDeployment(this, 'deployment', {
                spec: deploymentSpec,
              });

              const ns = new KubeNamespace(this, 'ns', {
                metadata: { name: nsName },
              });

              const deploy2 = new KubeDeployment(this, 'deployment2', {
                metadata: { namespace: nsName },
                spec: deploymentSpec,
              });

              deploy2.addDependency(ns, deploy);
            }
          },
        );

        new KubernetesProvider(stack, 'kuberneter-provider');
      }),
    ).toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
  },
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment-c85eb8eb_0F0FB78F\\": {
        \\"depends_on\\": [
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-deployment-c85eb8eb\\"
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
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment2-c869ef33-my-namespace_47DE066E\\": {
        \\"depends_on\\": [
          \\"kubernetes_manifest.cdk8s-chart_cdk8s-chart-v1-Namespace-my-namespace_7B90F59B\\",
          \\"kubernetes_manifest.cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment-c85eb8eb_0F0FB78F\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-deployment2-c869ef33\\",
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
      \\"cdk8s-chart_cdk8s-chart-v1-Namespace-my-namespace_7B90F59B\\": {
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

  test('Transform cdk8s Chart which has multiple ApiObjects and resource dependencies into cdktf Manifests', () => {
    expect(
      Testing.synthScope((stack) => {
        const ns = new Namespace(stack, 'namespace', {
          metadata: { name: nsName },
        });

        new Cdk8s(
          stack,
          'cdk8s-chart',
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

          { dependsOn: [ns] },
        );

        new KubernetesProvider(stack, 'kuberneter-provider');
      }),
    ).toMatchInlineSnapshot(`
"{
  \\"provider\\": {
    \\"kubernetes\\": [
      {
      }
    ]
  },
  \\"resource\\": {
    \\"kubernetes_manifest\\": {
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment-c85eb8eb-my-namespace_D4615023\\": {
        \\"depends_on\\": [
          \\"kubernetes_namespace.namespace\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-deployment-c85eb8eb\\",
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
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment2-c869ef33-my-namespace_47DE066E\\": {
        \\"depends_on\\": [
          \\"kubernetes_manifest.cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-deployment-c85eb8eb-my-namespace_D4615023\\",
          \\"kubernetes_namespace.namespace\\"
        ],
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-deployment2-c869ef33\\",
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
});
