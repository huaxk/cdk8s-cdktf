# CDKTF CDK8s

A compatability layer for transforming cdk8s constructs to kubernetes manifests within Terraform CDK.

## Usage

```ts
import { KubernetesProvider } from '@cdktf/provider-kubernetes';
import { Cdk8s } from 'cdk8s-cdktf';
import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { MyCdk8sChart } from './my-cdk8s-chart';

export class MyKubernetesStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new Cdk8s(scope, "chartName", MyCdk8sChart)

    new KubernetesProvider(this, 'kubernetes-provider', {
      configPath: "./kubeconfig.yaml",
      configContext: "my-dev-cluster",
    });
  }
}

const app = new App();
new MyKubernetesStack(app, "cdk8s-cdktf-stack");
app.synth();
```