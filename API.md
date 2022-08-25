# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Cdk8s <a name="Cdk8s" id="cdk8s-cdktf.Cdk8s"></a>

#### Initializers <a name="Initializers" id="cdk8s-cdktf.Cdk8s.Initializer"></a>

```typescript
import { Cdk8s } from 'cdk8s-cdktf'

new Cdk8s(scope: Construct, name: string, chartType: Chart, options?: ChartManifestOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.chartType">chartType</a></code> | <code>cdk8s.Chart</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.options">options</a></code> | <code><a href="#cdk8s-cdktf.ChartManifestOptions">ChartManifestOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-cdktf.Cdk8s.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `name`<sup>Required</sup> <a name="name" id="cdk8s-cdktf.Cdk8s.Initializer.parameter.name"></a>

- *Type:* string

---

##### `chartType`<sup>Required</sup> <a name="chartType" id="cdk8s-cdktf.Cdk8s.Initializer.parameter.chartType"></a>

- *Type:* cdk8s.Chart

---

##### `options`<sup>Optional</sup> <a name="options" id="cdk8s-cdktf.Cdk8s.Initializer.parameter.options"></a>

- *Type:* <a href="#cdk8s-cdktf.ChartManifestOptions">ChartManifestOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-cdktf.Cdk8s.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk8s-cdktf.Cdk8s.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-cdktf.Cdk8s.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk8s-cdktf.Cdk8s.isConstruct"></a>

```typescript
import { Cdk8s } from 'cdk8s-cdktf'

Cdk8s.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk8s-cdktf.Cdk8s.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-cdktf.Cdk8s.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk8s-cdktf.Cdk8s.property.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.property.manifests">manifests</a></code> | <code>@cdktf/provider-kubernetes.Manifest[]</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk8s-cdktf.Cdk8s.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-cdktf.Cdk8s.property.chart"></a>

```typescript
public readonly chart: Chart;
```

- *Type:* cdk8s.Chart

---

##### `manifests`<sup>Required</sup> <a name="manifests" id="cdk8s-cdktf.Cdk8s.property.manifests"></a>

```typescript
public readonly manifests: Manifest[];
```

- *Type:* @cdktf/provider-kubernetes.Manifest[]

---


## Structs <a name="Structs" id="Structs"></a>

### ChartManifestOptions <a name="ChartManifestOptions" id="cdk8s-cdktf.ChartManifestOptions"></a>

#### Initializer <a name="Initializer" id="cdk8s-cdktf.ChartManifestOptions.Initializer"></a>

```typescript
import { ChartManifestOptions } from 'cdk8s-cdktf'

const chartManifestOptions: ChartManifestOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels to apply to all resources in this chart. |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.namespace">namespace</a></code> | <code>string</code> | The default namespace for all objects defined in this chart (directly or indirectly). |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.connection">connection</a></code> | <code>cdktf.ISSHProvisionerConnection \| cdktf.IWinrmProvisionerConnection</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.count">count</a></code> | <code>number</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.dependsOn">dependsOn</a></code> | <code>cdktf.ITerraformDependable[]</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.forEach">forEach</a></code> | <code>cdktf.ITerraformIterator</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.lifecycle">lifecycle</a></code> | <code>cdktf.TerraformResourceLifecycle</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.provider">provider</a></code> | <code>cdktf.TerraformProvider</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.ChartManifestOptions.property.provisioners">provisioners</a></code> | <code>cdktf.IFileProvisioner \| cdktf.ILocalExecProvisioner \| cdktf.IRemoteExecProvisioner[]</code> | *No description.* |

---

##### `labels`<sup>Optional</sup> <a name="labels" id="cdk8s-cdktf.ChartManifestOptions.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no common labels

Labels to apply to all resources in this chart.

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk8s-cdktf.ChartManifestOptions.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string
- *Default:* no namespace is synthesized (usually this implies "default")

The default namespace for all objects defined in this chart (directly or indirectly).

This namespace will only apply to objects that don't have a
`namespace` explicitly defined for them.

---

##### `connection`<sup>Optional</sup> <a name="connection" id="cdk8s-cdktf.ChartManifestOptions.property.connection"></a>

```typescript
public readonly connection: ISSHProvisionerConnection | IWinrmProvisionerConnection;
```

- *Type:* cdktf.ISSHProvisionerConnection | cdktf.IWinrmProvisionerConnection

---

##### `count`<sup>Optional</sup> <a name="count" id="cdk8s-cdktf.ChartManifestOptions.property.count"></a>

```typescript
public readonly count: number;
```

- *Type:* number

---

##### `dependsOn`<sup>Optional</sup> <a name="dependsOn" id="cdk8s-cdktf.ChartManifestOptions.property.dependsOn"></a>

```typescript
public readonly dependsOn: ITerraformDependable[];
```

- *Type:* cdktf.ITerraformDependable[]

---

##### `forEach`<sup>Optional</sup> <a name="forEach" id="cdk8s-cdktf.ChartManifestOptions.property.forEach"></a>

```typescript
public readonly forEach: ITerraformIterator;
```

- *Type:* cdktf.ITerraformIterator

---

##### `lifecycle`<sup>Optional</sup> <a name="lifecycle" id="cdk8s-cdktf.ChartManifestOptions.property.lifecycle"></a>

```typescript
public readonly lifecycle: TerraformResourceLifecycle;
```

- *Type:* cdktf.TerraformResourceLifecycle

---

##### `provider`<sup>Optional</sup> <a name="provider" id="cdk8s-cdktf.ChartManifestOptions.property.provider"></a>

```typescript
public readonly provider: TerraformProvider;
```

- *Type:* cdktf.TerraformProvider

---

##### `provisioners`<sup>Optional</sup> <a name="provisioners" id="cdk8s-cdktf.ChartManifestOptions.property.provisioners"></a>

```typescript
public readonly provisioners: IFileProvisioner | ILocalExecProvisioner | IRemoteExecProvisioner[];
```

- *Type:* cdktf.IFileProvisioner | cdktf.ILocalExecProvisioner | cdktf.IRemoteExecProvisioner[]

---



