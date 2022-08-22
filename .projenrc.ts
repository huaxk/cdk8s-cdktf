import { cdktf, javascript } from 'projen';
const project = new cdktf.ConstructLibraryCdktf({
  author: 'huaxk',
  authorAddress: 'huaxk@163.com',
  cdktfVersion: '^0.12.0',
  constructsVersion: '^10.0.107',
  defaultReleaseBranch: 'main',
  name: 'cdk8s-cdktf',
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/huaxk/cdk8s-cdktf.git',

  bundledDeps: ['yaml@1.10.2'],
  devDeps: ['@cdktf/provider-kubernetes', 'cdk8s-cli'],
  peerDeps: ['@cdktf/provider-kubernetes@^2.0.0', 'cdk8s@>=2.1.6'],
  description:
    'A compatability layer for transforming cdk8s constructs to kubernetes manifests within Terraform CDK.',
  license: 'MIT',
});

project.eslint?.addIgnorePattern('test/imports/');
project.jest?.addIgnorePattern('test/imports');

const importTask = project.addTask('import', {
  condition: '[ ! -f "test/imports/k8s.ts" ]',
  exec: 'cd ./test && cdk8s import k8s --language typescript',
});
project.testTask.prependSpawn(importTask);

project.synth();