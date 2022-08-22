import { Manifest, ManifestConfig } from '@cdktf/provider-kubernetes';
import { App, Chart } from 'cdk8s';
import { Construct } from 'constructs';
import * as yaml from 'yaml';

type ManifestOption = Omit<ManifestConfig, 'manifest'>;

export class Cdk8sConstructBase extends Construct {
  private _name: string;
  private _options: ManifestOption;
  private _app: App;
  private _manifests: Manifest[] = [];

  constructor(scope: Construct, name: string, options: ManifestOption) {
    super(scope, name);
    this._name = name;
    this._options = options;
    this._app = new App();
  }

  public toCdktfManifests() {
    const yamlmanifests = yaml.parseAllDocuments(this.app.synthYaml());

    yamlmanifests.forEach((yamlManifest) => {
      const jsonManifest = yamlManifest.toJSON();
      if (!jsonManifest) return;
      const type = `${jsonManifest.apiVersion}-${jsonManifest.kind}`;
      // const namespace = jsonManifest.metadata.namespace || 'default';
      const namespace = jsonManifest.metadata.namespace
        ? '-' + jsonManifest.metadata.namespace
        : '';
      const uniqueId = `${
        jsonManifest.metadata.name || jsonManifest.metadata.generatename
      }${namespace}`;

      const manifestConfig = this._options;
      this.manifests.push(
        new Manifest(this, `${this._name}-${type}-${uniqueId}`, {
          ...manifestConfig,
          manifest: jsonManifest,
        }),
      );
    });
  }

  public get app() {
    return this._app;
  }

  public get manifests() {
    return this._manifests;
  }
}

export class Cdk8s<T extends Construct, Props> extends Cdk8sConstructBase {
  constructor(
    scope: Construct,
    name: string,
    t: { new (scope: Construct, id: string, props: Props): T },
    options: Props & ManifestOption,
  ) {
    super(scope, name, options);

    if (t instanceof Chart) {
      new t(this.app, `${name}`, options as Props);
    } else {
      const chart = new Chart(this.app, `${name}-cdk8s-chart`);
      new t(chart, `${name}`, options as Props);
    }

    this.toCdktfManifests();
  }
}
