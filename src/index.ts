import { Manifest } from '@cdktf/provider-kubernetes';
import { ApiObject, App, Chart, ChartProps, DependencyGraph } from 'cdk8s';
import { TerraformMetaArguments } from 'cdktf';
import { Construct } from 'constructs';
import debug from 'debug';

const dbg = debug('cdk8s-cdktf');
debug.enable('cdk8s-cdktf');

type ManifestOption = TerraformMetaArguments;

export interface ChartManifestOptions extends ChartProps, ManifestOption {}

export class Cdk8s extends Construct {
  private _manifests: Manifest[] = [];
  private _chart: Chart;

  constructor(
    scope: Construct,
    name: string,
    chartType: typeof Chart,
    options?: ChartManifestOptions,
  ) {
    super(scope, name);

    this._chart = new chartType(new App(), name, options as ChartProps);

    const map: Map<string, Manifest> = new Map(); // map ApiObject to Manifest for transforming dependencies, the ApiObject node id as key, Manifest as value

    validate(this.chart);
    dbg(
      'all nodes:',
      this.chart.node.findAll().map((x) => x.node.id),
    );

    const apiObjects = chartToKube(this.chart);
    dbg(
      'apiobjects:',
      apiObjects.map((x) => x.node.id),
    );

    apiObjects.forEach((apiObject) => {
      const jsonManifest = apiObject.toJson();

      const manifestDeps = options?.dependsOn || [];

      const type = `${jsonManifest.apiVersion}-${jsonManifest.kind}`;
      const namespaceSuffix = jsonManifest.metadata.namespace
        ? '-' + jsonManifest.metadata.namespace
        : '';
      const uniqueId = `${
        jsonManifest.metadata.name || jsonManifest.metadata.generatename
      }${namespaceSuffix}`;
      const manifestName = `${name}-${type}-${uniqueId}`;

      const deps = apiObject.node.dependencies.map((a) => {
        const id = a.node.id;
        if (!map.has(id)) {
          throw new Error(`Dependence: ${a.node.id} not found in manifests`);
        }
        return map.get(id)!;
      });

      let manifest = new Manifest(this, manifestName, {
        ...options,
        manifest: jsonManifest,
        dependsOn: [...deps, ...manifestDeps],
      });

      this.manifests.push(manifest);
      map.set(apiObject.node.id, manifest);
    });

    dbg(
      'manifests:',
      this.manifests.map((m) => m.node.id),
    );
  }

  public get manifests() {
    return this._manifests;
  }

  public get chart() {
    return this._chart;
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
    .filter((x) => x !== chart)
    .map((x) => x as ApiObject);
}
