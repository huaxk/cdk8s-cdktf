# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Cdk8s <a name="Cdk8s" id="cdk8s-cdktf.Cdk8s"></a>

#### Initializers <a name="Initializers" id="cdk8s-cdktf.Cdk8s.Initializer"></a>

```typescript
import { Cdk8s } from 'cdk8s-cdktf'

new Cdk8s(scope: Construct, name: string, chartType: Chart, options?: IChartManifestOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.chartType">chartType</a></code> | <code>cdk8s.Chart</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.Cdk8s.Initializer.parameter.options">options</a></code> | <code><a href="#cdk8s-cdktf.IChartManifestOptions">IChartManifestOptions</a></code> | *No description.* |

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

- *Type:* <a href="#cdk8s-cdktf.IChartManifestOptions">IChartManifestOptions</a>

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




## Protocols <a name="Protocols" id="Protocols"></a>

### IChartManifestOptions <a name="IChartManifestOptions" id="cdk8s-cdktf.IChartManifestOptions"></a>

- *Implemented By:* <a href="#cdk8s-cdktf.IChartManifestOptions">IChartManifestOptions</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-cdktf.IChartManifestOptions.property.chartOptions">chartOptions</a></code> | <code>cdk8s.ChartProps</code> | *No description.* |
| <code><a href="#cdk8s-cdktf.IChartManifestOptions.property.manifestOptions">manifestOptions</a></code> | <code>cdktf.TerraformMetaArguments</code> | *No description.* |

---

##### `chartOptions`<sup>Optional</sup> <a name="chartOptions" id="cdk8s-cdktf.IChartManifestOptions.property.chartOptions"></a>

```typescript
public readonly chartOptions: ChartProps;
```

- *Type:* cdk8s.ChartProps

---

##### `manifestOptions`<sup>Optional</sup> <a name="manifestOptions" id="cdk8s-cdktf.IChartManifestOptions.property.manifestOptions"></a>

```typescript
public readonly manifestOptions: TerraformMetaArguments;
```

- *Type:* cdktf.TerraformMetaArguments

---

