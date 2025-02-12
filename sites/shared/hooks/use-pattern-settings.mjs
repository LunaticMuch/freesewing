//  __SDEFILE__ - This file is a dependency for the stand-alone environment
import { useAtom } from 'jotai'
import { atomWithHash } from 'jotai-location'

const baseSettings = atomWithHash('settings', false, { delayInit: true })

export const usePatternSettings = () => useAtom(baseSettings)
