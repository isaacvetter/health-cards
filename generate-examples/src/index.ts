/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';

const exampleBundes = [
  'http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/Bundle-Scenario1Bundle.json',
  'http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/Bundle-Scenario2Bundle.json',
];

interface Bundle {
  id?: string;
  entry: {
    fullUrl: string;
    resource: {
      meta?: any;
      id?: any;
      [k: string]: any;
    };
  }[];
}

interface StringMap {
  [k: string]: string;
}

async function toHealthCard(bundleIn: Bundle) {
  const bundle: Bundle = JSON.parse(JSON.stringify(bundleIn)) as Bundle;

  const resourceUrlMap: StringMap = bundle.entry
    .map((e, i) => [e.fullUrl.split('/').slice(-1)[0], `resource:${i}`])
    .reduce((acc: StringMap, [a, b]) => {
      acc[a] = b;
      return acc;
    }, {});

  delete bundle.id;
  bundle.entry.forEach((e) => {
    e.fullUrl = resourceUrlMap[e.fullUrl];
    function clean(r: any, path: string[] = ['Resource']) {
      if (path.length === 1) {
        delete r.id;
        delete r.meta;
        delete r.text;
      }
      if (resourceUrlMap[r.reference]) {
        r.reference = resourceUrlMap[r.reference];
      }
      if (Array.isArray(r)) {
        r.forEach((e) => clean(e, path));
      }
    }
    clean(e.resource);
  });

  console.log('resourena', JSON.stringify(bundle, null, 2));
}

async function generate() {
  const bundles = await Promise.all(exampleBundes.map((bUrl) => got(bUrl).json()));

  console.log(
    'Budes',
    bundles.map((b) => toHealthCard(b as Bundle)),
  );
}

generate();
