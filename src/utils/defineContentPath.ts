

import slugify from '@sindresorhus/slugify';

export function defineContentPath(file) {

  const firstPath = `data/content/${slugify(file.game)}`;
  const secondPath = slugify(`${file.contentType}s`)
  let fullFilePath = `${firstPath}/${secondPath}/`

  if (file.gametype) {
    fullFilePath += `${slugify(file.gametype)}`
  }

  return fullFilePath
}
