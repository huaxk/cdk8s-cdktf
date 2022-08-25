import { KubernetesProvider, Namespace } from '@cdktf/provider-kubernetes';
import { Chart } from 'cdk8s';
import { Testing } from 'cdktf';
import { Construct } from 'constructs';
import { Cdk8s } from '../src';
// import { Cdk8s } from '../';
import { KubeDeployment, KubeNamespace } from './imports/k8s';

describe('CDK8sCdktf', () => {
  test('Transform empty cdk8s Chart into cdktf plan', () => {
    expect(
      Testing.synthScope((scope) => {
        new Cdk8s(
          scope,
          'cdk8s-chart',
          class extends Chart {
            constructor(scp: Construct, id: string) {
              super(scp, id);
            }
          },
        );

        new KubernetesProvider(scope, 'kuberneters-provider');
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
      Testing.synthScope((scope) => {
        const label = { app: 'test' };
        new Cdk8s(
          scope,
          'cdk8s-chart',
          class extends Chart {
            constructor(scp: Construct, id: string) {
              super(scp, id);

              new KubeDeployment(this, 'deployment', {
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


            }
          });


        new KubernetesProvider(scope, 'kuberneters-provider');
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
      Testing.synthScope((scope) => {
        new Cdk8s(
          scope,
          'cdk8s-chart',
          class extends Chart {
            constructor(scp: Construct, id: string) {
              super(scp, id);
              const label = { app: 'test' };

              const deploy = new KubeDeployment(this, 'deployment', {
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


              const ns = new KubeNamespace(this, 'ns', { metadata: { name: 'my-namespace' } });


              const deploy2 = new KubeDeployment(this, 'deployment2', {
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


              deploy2.addDependency(ns, deploy);
            }
          });


        new KubernetesProvider(scope, 'kuberneter-provider');
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
      Testing.synthScope((scope) => {
        const ns = new Namespace(scope, 'namespace', { metadata: { name: 'my-namespace' } });


        new Cdk8s(
          scope,
          'cdk8s-chart',
          class extends Chart {
            constructor(scp: Construct, id: string) {
              super(scp, id);
              const label = { app: 'test' };

              const deploy = new KubeDeployment(this, 'deployment', {
                metadata: { namespace: 'my-namespace' },

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


              const deploy2 = new KubeDeployment(this, 'deployment2', {
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


              deploy2.addDependency(deploy);
            }
          },


          { dependsOn: [ns] });


        new KubernetesProvider(scope, 'kuberneter-provider');
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
