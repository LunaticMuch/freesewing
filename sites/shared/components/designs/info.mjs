// Dependencies
import {
  nsMerge,
  capitalize,
  optionsMenuStructure,
  optionType,
  cloudflareImageUrl,
} from 'shared/utils.mjs'
import { designs } from 'shared/config/designs.mjs'
import { examples } from 'site/prebuild/design-examples.mjs'
// Hooks
import { useTranslation } from 'next-i18next'
import { useDesign } from 'shared/hooks/use-design.mjs'
import { useContext, Fragment } from 'react'
// Context
import { ModalContext } from 'shared/context/modal-context.mjs'
// Components
import { ModalWrapper } from 'shared/components/wrappers/modal.mjs'
import { lineDrawings } from 'shared/components/designs/linedrawings/index.mjs'
import { ns as designNs } from 'shared/components/designs/design.mjs'
import { Difficulty } from 'shared/components/designs/difficulty.mjs'
import { PageLink, AnchorLink, Link } from 'shared/components/link.mjs'
import { DocsLink, DocsTitle } from 'shared/components/mdx/docs-helpers.mjs'
import { DynamicOrgDocs as DynamicDocs } from 'site/components/dynamic-org-docs.mjs'
import { Popout } from 'shared/components/popout/index.mjs'

// Translation namespaces used on this page
export const ns = nsMerge(
  designNs,
  'account',
  'tags',
  'techniques',
  'measurements',
  'workbench',
  'designs'
)

const Option = ({ id, option, t, design }) =>
  optionType(option) === 'constant' ? null : (
    <li key={option.name}>
      <PageLink
        txt={t(`${design}:${option.name}.t`)}
        href={`/docs/designs/${design}/options/${id.toLowerCase()}`}
      />
    </li>
  )

const OptionGroup = ({ id, group, t, design }) => (
  <li key={id}>
    <b>{t(`workbench:${id}`)}</b>
    <ul className="list list-inside list-disc pl-2">
      {Object.entries(group).map(([sid, entry]) =>
        entry.isGroup ? (
          <OptionGroup id={sid} key={sid} t={t} group={entry} desing={design} />
        ) : (
          <Option key={sid} id={sid} t={t} option={entry} design={design} />
        )
      )}
    </ul>
  </li>
)
const SimpleOptionsList = ({ options, t, design }) => {
  const structure = optionsMenuStructure(options, {})
  const output = []
  for (const [key, entry] of Object.entries(structure)) {
    const shared = { key, t, design, id: key }
    if (entry.isGroup) output.push(<OptionGroup {...shared} group={entry} />)
    else output.push(<Option {...shared} option={entry} />)
  }

  return <ul className="list list-inside pl-2 list-disc">{output}</ul>
}

export const DesignInfo = ({ design }) => {
  const { setModal } = useContext(ModalContext)
  const { t, i18n } = useTranslation([...ns, design])
  const { language } = i18n
  const Design = useDesign(design)
  const config = Design.patternConfig

  // Translate measurements
  const measies = { required: {}, optional: {} }
  if (config.measurements) {
    for (const m of config.measurements) measies.required[m] = t(`measurements:${m}`)
  }
  if (config.optionalMeasurements) {
    for (const m of config.optionalMeasurements) measies.optional[m] = t(`measurements:${m}`)
  }

  // Linedrawing
  const LineDrawing = lineDrawings[design]
    ? lineDrawings[design]
    : ({ className }) => <div className={className}></div>

  return (
    <>
      <h5 className="-mt-6 text-accent font-medium">#FreeSewing{capitalize(design)}</h5>
      <p className="text-xl">{t(`designs:${design}.d`)}</p>

      <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center p-4 border rounded-lg bg-secondary bg-opacity-5 max-w-4xl">
        <b>Jump to:</b>
        <AnchorLink id="notes">
          <DocsTitle
            slug={`docs/designs/${design}/notes`}
            language={language}
            format={(t) => t.split(':').pop().trim()}
          />
        </AnchorLink>
        <AnchorLink id="examples" txt={t('acount:examples')} />
        {['needs', 'fabric'].map((page) => (
          <AnchorLink id={page} key={page}>
            <DocsTitle
              slug={`docs/designs/${design}/${page}`}
              language={language}
              format={(t) => t.split(':').pop().trim()}
            />
          </AnchorLink>
        ))}
        <AnchorLink id="docs" txt={t('account:docs')} />
        <AnchorLink id="specs" txt={t('account:specifications')} />
      </div>

      <div className="flex flex-row flex-wrap mt-8 justify-between w-full">
        <div className="w-full md:w-2/3 pr-0 md:pr-8 max-w-2xl">
          <LineDrawing className="w-full" />

          <h2 id="notes">
            <DocsTitle
              slug={`docs/designs/${design}/notes`}
              language={language}
              format={(t) => t.split(':').pop().trim()}
            />
          </h2>
          <DynamicDocs path={`designs/${design}/notes`} language={language} noFooter noTitle />

          <h2 id="examples">{t('account:examples')}</h2>
          {examples[design] ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-3">
              {examples[design].map((ex) => (
                <button
                  key={ex}
                  onClick={() =>
                    setModal(
                      <ModalWrapper flex="col" justify="top lg:justify-center" slideFrom="right">
                        <img
                          className="w-full shadow rounded-lg"
                          src={cloudflareImageUrl({ id: `showcase-${ex}`, variant: 'public' })}
                        />
                        <p className="text-center">
                          <PageLink href={`/showcase/${ex}`} txt={t('account:visitShowcase')} />
                        </p>
                      </ModalWrapper>
                    )
                  }
                >
                  <img
                    className="w-full shadow rounded-lg"
                    src={cloudflareImageUrl({ id: `showcase-${ex}`, variant: 'sq500' })}
                  />
                </button>
              ))}
            </div>
          ) : (
            <Popout note>
              <h5>{t('account:noExamples')}</h5>
              <p>{t('account:noExamplesMsg')}</p>
              <p className="text-right">
                <Link className="btn btn-primary" href="/new/showcase">
                  {t('account:showcaseNew')}
                </Link>
              </p>
            </Popout>
          )}

          {['needs', 'fabric'].map((page) => (
            <Fragment key={page}>
              <h2 id={page}>
                <DocsTitle
                  slug={`docs/designs/${design}/${page}`}
                  language={language}
                  format={(t) => t.split(':').pop().trim()}
                />
              </h2>
              <DynamicDocs
                path={`designs/${design}/${page}`}
                language={language}
                noFooter
                noTitle
              />
            </Fragment>
          ))}

          <h2 id="docs">{t('account:docs')}</h2>
          <ul className="list list-disc list-inside pl-2">
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/cutting`} />
            </li>
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/instructions`} />
            </li>
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/needs`} />
            </li>
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/fabric`} />
            </li>
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/options`} />
            </li>
            <li>
              <DocsLink site="org" slug={`docs/designs/${design}/notes`} />
            </li>
          </ul>
        </div>

        <div className="w-full md:w-1/3">
          <h2 id="specs">{t('account:specifications')}</h2>

          <h6 className="mt-4">{t('account:design')}</h6>
          <ul>
            {designs[design].design.map((person) => (
              <li key={person}>{person}</li>
            ))}
          </ul>

          <h6 className="mt-4">{t('account:code')}</h6>
          <ul>
            {designs[design].code.map((person) => (
              <li key={person}>{person}</li>
            ))}
          </ul>

          <h6 className="mt-4">{t('tags:difficulty')}</h6>
          <Difficulty score={designs[design].difficulty} />

          <h6 className="mt-4">{t('tags:tags')}</h6>
          <div className="flex flex-row flex-wrap items-center gap-1">
            {designs[design].tags.map((tag) => (
              <span className="badge badge-primary font-medium" key={tag}>
                {t(`tags:${tag}`)}
              </span>
            ))}
          </div>

          <h6 className="mt-4">{t('techniques:techniques')}</h6>
          <div className="flex flex-row flex-wrap items-center gap-1">
            {designs[design].techniques.map((tech) => (
              <span className="badge badge-accent font-medium" key={tech}>
                {t(`techniques:${tech}`)}
              </span>
            ))}
          </div>

          {Object.keys(measies.required).length > 0 ? (
            <>
              <h6 className="mt-4">{t('account:requiredMeasurements')}</h6>
              <ul className="list list-disc list-inside pl-2">
                {Object.keys(measies.required)
                  .sort()
                  .map((m) => (
                    <li key={m}>
                      <PageLink href={`/docs/measurements/${m}`} txt={measies.required[m]} />
                    </li>
                  ))}
              </ul>
            </>
          ) : null}

          {Object.keys(measies.optional).length > 0 ? (
            <>
              <h6 className="mt-4">{t('account:optionalMeasurements')}</h6>
              <ul className="list list-disc list-inside pl-2">
                {Object.keys(measies.optional)
                  .sort()
                  .map((m) => (
                    <li key={m}>
                      <PageLink href={`/docs/measurements/${m}`} txt={measies.optional[m]} />
                    </li>
                  ))}
              </ul>
            </>
          ) : null}

          <h6 className="mt-4">{t('account:designOptions')}</h6>
          <SimpleOptionsList options={config.options} t={t} design={design} />

          <h6 className="mt-4">{t('account:parts')}</h6>
          <ul className="list list-disc list-inside pl-2">
            {config.draftOrder.map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ul>
          {Object.keys(config.plugins).length > 0 ? (
            <>
              <h6 className="mt-4">{t('account:plugins')}</h6>
              <ul className="list list-disc list-inside pl-2">
                {Object.keys(config.plugins).map((plugin) => (
                  <li key={plugin}>{plugin}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}