import { Manifest } from '@cdktf/provider-kubernetes';
import { ApiObject, App, Chart, ChartProps, DependencyGraph } from 'cdk8s';
import { TerraformMetaArguments } from 'cdktf';
import { Construct } from 'constructs';

type ManifestOption = TerraformMetaArguments;

export interface IChartManifestOptions<Props extends ChartProps> {
  chartOptions?: Props;
  manifestOptions?: ManifestOption;
}

export class Cdk8s<Props extends ChartProps> extends Construct {
  public name: string;
  public manifests: Array<Manifest> = [];
  public chart: Chart;

  constructor(
    scope: Construct,
    name: string,
    chartType: typeof Chart,
    options?: IChartManifestOptions<Props>,
  ) {
    super(scope, name);
    this.name = name;

    const map: Map<string, Manifest> = new Map(); // map ApiObject to Manifest for transforming dependencies, the ApiObject node id as key, Manifest as value

    this.chart = new chartType(new App(), this.name, options?.chartOptions);
    validate(this.chart);
    const apiObjects = chartToKube(this.chart);

    apiObjects.forEach((apiObject) => {
      const jsonManifest = apiObject.toJson();

      const deps = apiObject.node.dependencies.map((a) => {
        const id = a.node.id;
        if (!map.has(id)) {
          throw new Error(`Dependence: ${a.node.id} not found in manifests`);
        }
        return map.get(id)!;
      });

      const manifestDeps = options?.manifestOptions?.dependsOn || [];
      const manifestName = this.generateUniqueId(apiObject);
      const manifest = new Manifest(this, manifestName, {
        ...options?.manifestOptions,
        manifest: jsonManifest,
        dependsOn: [...deps, ...manifestDeps],
      });

      this.manifests.push(manifest);
      map.set(apiObject.node.id, manifest);
    });
  }

  public generateUniqueId(apiObject: ApiObject) {
    const vk = `${apiObject.apiVersion}-${apiObject.kind}`;
    const uniqueId =
      apiObject.metadata.name ||
      Chart.of(apiObject).generateObjectName(apiObject);
    const ns = apiObject.metadata.namespace;
    const nsSuffix = ns ? `-${ns}` : '';
    return `${this.name}-${vk}-${uniqueId}${nsSuffix}`;
  }
}

function validate(chart: Chart) {
  const errors = [];
  for (const child of chart.node.findAll()) {
    const childErrors = child.node.validate();
    for (const error of childErrors) {
      errors.push(`[${child.node.path}] ${error}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Validation failed with the following errors:\n  ${errors.join('\n  ')}`,
    );
  }
}

function chartToKube(chart: Chart) {
  return new DependencyGraph(chart.node)
    .topology()
    .filter((x) => x instanceof ApiObject)
    .filter((x) => Chart.of(x) === chart)
    .map((x) => x as ApiObject);
}
