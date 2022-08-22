import { KubernetesProvider } from '@cdktf/provider-kubernetes';
import { Chart } from 'cdk8s';
import { Testing } from 'cdktf';
import { Construct } from 'constructs';
import { Cdk8s } from '../src';
import { KubeDeployment, KubeNamespace } from './imports/k8s';

describe('CDK8sCdktf', () => {
  test('synthesises YAML into CDKTF plan', () => {
    expect(
      Testing.synthScope((scope) => {
        const label = { app: 'test' };
        new Cdk8s(scope, 'deployment', KubeDeployment, {
          spec: {
            replicas: 1,
            selector: { matchLabels: label },

            template: {
              metadata: { labels: label },
              spec: {
                containers: [
                  {
                    name: 'hello-kubernetes',
                    image: 'paulbouwer/hello-kubernetes:1.7',
                    ports: [{ containerPort: 8080 }],
                  },
                ],
              },
            },
          },
        });

        new KubernetesProvider(scope, 'cdk8s-provider');
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
      \\"deployment_deployment-apps--v1-Deployment-deployment-cdk8s-chart-deployment-c8f89653_52002A02\\": {
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"deployment-cdk8s-chart-deployment-c8f89653\\"
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

  test('synthesises multiple YAMLs into CDKTF plan', () => {
    expect(
      Testing.synthScope((scope) => {
        const label = { app: 'test' };
        new Cdk8s(scope, 'deployment', KubeDeployment, {
          spec: {
            replicas: 1,
            selector: { matchLabels: label },

            template: {
              metadata: { labels: label },
              spec: {
                containers: [
                  {
                    name: 'hello-kubernetes',
                    image: 'paulbouwer/hello-kubernetes:1.7',
                    ports: [{ containerPort: 8080 }],
                  },
                ],
              },
            },
          },
        });

        new Cdk8s(scope, 'ns', KubeNamespace, {
          metadata: { name: 'my-namespace' },
        });

        new Cdk8s(scope, 'deployment2', KubeDeployment, {
          metadata: { namespace: 'my-namespace' },

          spec: {
            replicas: 1,
            selector: { matchLabels: label },

            template: {
              metadata: { labels: label },
              spec: {
                containers: [
                  {
                    name: 'hello-kubernetes2',
                    image: 'paulbouwer/hello-kubernetes:1.8',
                    ports: [{ containerPort: 8080 }],
                  },
                ],
              },
            },
          },
        });

        new KubernetesProvider(scope, 'kuberneter-provider');
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
      \\"deployment2_deployment2-apps--v1-Deployment-deployment2-cdk8s-chart-deployment2-c8799765-my-namespace_032D1105\\": {
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"deployment2-cdk8s-chart-deployment2-c8799765\\",
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
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.8\\",
                    \\"name\\": \\"hello-kubernetes2\\",
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
      \\"deployment_deployment-apps--v1-Deployment-deployment-cdk8s-chart-deployment-c8f89653_52002A02\\": {
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"deployment-cdk8s-chart-deployment-c8f89653\\"
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
      \\"ns_ns-v1-Namespace-my-namespace_119F99BD\\": {
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

  test('synthesises cdk8s chart into CDKTF plan', () => {
    expect(
      Testing.synthScope((scope) => {
        new Cdk8s(
          scope,
          'cdk8s-chart',
          class extends Chart {
            constructor(scp: Construct, id: string) {
              super(scp, id);
              const label = { app: 'test' };

              new KubeDeployment(scp, 'deployment', {
                spec: {
                  replicas: 1,
                  selector: { matchLabels: label },

                  template: {
                    metadata: { labels: label },
                    spec: {
                      containers: [
                        {
                          name: 'hello-kubernetes',
                          image: 'paulbouwer/hello-kubernetes:1.7',
                          ports: [{ containerPort: 8080 }],
                        },
                      ],
                    },
                  },
                },
              });

              new KubeNamespace(scp, 'ns', {
                metadata: { name: 'my-namespace' },
              });

              new KubeDeployment(scp, 'deployment2', {
                metadata: { namespace: 'my-namespace' },

                spec: {
                  replicas: 1,
                  selector: { matchLabels: label },

                  template: {
                    metadata: { labels: label },
                    spec: {
                      containers: [
                        {
                          name: 'hello-kubernetes2',
                          image: 'paulbouwer/hello-kubernetes:1.8',
                          ports: [{ containerPort: 8080 }],
                        },
                      ],
                    },
                  },
                },
              });
            }
          },
          {},
        );

        new KubernetesProvider(scope, 'kuberneter-provider');
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
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-cdk8s-chart-deployment-c80dc8f3_89C93BCF\\": {
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-cdk8s-chart-deployment-c80dc8f3\\"
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
      \\"cdk8s-chart_cdk8s-chart-apps--v1-Deployment-cdk8s-chart-cdk8s-chart-deployment2-c81e8f3c-my-namespace_E7377F2E\\": {
        \\"manifest\\": {
          \\"apiVersion\\": \\"apps/v1\\",
          \\"kind\\": \\"Deployment\\",
          \\"metadata\\": {
            \\"name\\": \\"cdk8s-chart-cdk8s-chart-deployment2-c81e8f3c\\",
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
                    \\"image\\": \\"paulbouwer/hello-kubernetes:1.8\\",
                    \\"name\\": \\"hello-kubernetes2\\",
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
});
