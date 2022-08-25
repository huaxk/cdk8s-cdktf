import { cdktf, javascript } from 'projen';
const project = new cdktf.ConstructLibraryCdktf({
  author: 'huaxk',
  authorAddress: 'huaxk@163.com',
  cdktfVersion: '^0.12.0',
  constructsVersion: '^10.1.65',
  defaultReleaseBranch: 'main',
  name: 'cdk8s-cdktf',
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/huaxk/cdk8s-cdktf.git',

  bundledDeps: ['yaml@1.10.2', 'debug'],
  devDeps: ['cdk8s-cli', '@types/debug'],
  peerDeps: ['@cdktf/provider-kubernetes@^2.0.0', 'cdk8s@>=2.3.74'],
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

project.release?.publisher.publishToNpm({
  prePublishSteps: [
    {
      name: 'Prepare Repository',
      run: 'mv dist .repo',
    },
    {
      name: 'Install Dependencies',
      run: 'cd .repo && npm i --frozen-lockfile',
    },
    {
      name: 'Create js artifact',
      run: 'cd .repo && npx projen package:js',
    },
    {
      name: 'Collect js Artifact',
      run: 'mv .repo/dist dist',
    },
  ],
  registry: 'registry.npmjs.org',
});

project.synth();
