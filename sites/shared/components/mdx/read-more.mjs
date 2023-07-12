import get from 'lodash.get'
import Link from 'next/link'
import { useContext } from 'react'
import { NavigationContext } from 'shared/context/navigation-context.mjs'
import { useNavigation } from 'site/hooks/use-navigation.mjs'

const getRoot = {
  dev: (root, nav) => {
    if (!root) return nav
    if (root.indexOf('/') === -1) return nav[root]
    return get(nav, root.split('/'))
  },
  org: (root, nav) => {
    // Fixme: make this work for org
    if (!root) return nav
    if (root.indexOf('/') === -1) return get(nav, root)
    return get(nav, root.split('/'))
  },
}

/*
 * This is a recursive function, so it needs to be lean
 */
const RenderTree = ({ tree }) => (
  <ul>
    {Object.keys(tree)
      .filter((key) => key.length > 1)
      .map((key, i) => (
        <li key={i}>
          <Link href={`/${tree[key].s}`}>{tree[key].t}</Link>
          {Object.keys(tree[key]).length > 1 && <RenderTree tree={tree[key]} />}
        </li>
      ))}
  </ul>
)

export const ReadMore = ({ recurse = 0, root = false, site = 'org', level = 0, ignoreControl }) => {
  const { slug } = useContext(NavigationContext)
  const siteNav = useNavigation({ ignoreControl })

  // Deal with recurse not being a number
  if (recurse && recurse !== true) {
    if (typeof recurse === 'number') recurse--
    else recurse = 1
  }

  // Deal with root being passed as true
  if (root === true) root = ''

  const tree = root === false ? getRoot[site](slug, siteNav) : getRoot[site](root, siteNav)

  return <RenderTree {...{ tree, recurse }} />
}
