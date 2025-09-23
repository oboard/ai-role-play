import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { GameState, Scene, Character } from '@/types/game';

export function useGameData() {
  const { t } = useTranslation();

  const prisonCellCharacters: Character[] = useMemo(() => [
    {
      id: 'guard',
      name: t('guardZhang'),
      role: t('prisonGuard'),
      description: t('guardDescription'),
      position: [1.5, 0, 2],
      color: '#4a5568',
      mood: 'suspicious',
      personality: t('guardPersonality'),
      knowledge: [
        t('guardKnowledge1'),
        t('guardKnowledge2'),
        t('guardKnowledge3')
      ],
      secrets: [
        t('guardSecret1'),
        t('guardSecret2')
      ]
    },
    {
      id: 'cellmate',
      name: t('oldWang'),
      role: t('cellmate'),
      description: t('cellmateDescription'),
      position: [-1.5, 0, -1],
      color: '#2d3748',
      mood: 'helpful',
      personality: t('cellmatePersonality'),
      knowledge: [
        t('cellmateKnowledge1'),
        t('cellmateKnowledge2'),
        t('cellmateKnowledge3')
      ],
      secrets: [
        t('cellmateSecret1'),
        t('cellmateSecret2')
      ]
    },
    {
      id: 'prisoner',
      name: t('ahQiang'),
      role: t('convictedThief'),
      description: t('prisonerDescription'),
      position: [0, 0, -2.5],
      color: '#1a202c',
      mood: 'nervous',
      personality: t('prisonerPersonality'),
      knowledge: [
        t('prisonerKnowledge1'),
        t('prisonerKnowledge2'),
        t('prisonerKnowledge3')
      ],
      secrets: [
        t('prisonerSecret1'),
        t('prisonerSecret2'),
        t('prisonerSecret3')
      ]
    }
  ], [t]);

  const prisonCellScene: Scene = useMemo(() => ({
    id: 'prison-cell',
    name: t('prisonCellName'),
    description: t('prisonCellDescription'),
    characters: prisonCellCharacters,
    atmosphere: t('prisonCellAtmosphere')
  }), [t, prisonCellCharacters]);

  const initialGameState: GameState = useMemo(() => ({
    currentScene: prisonCellScene,
    selectedCharacter: null,
    evidenceList: [],
    timeStarted: new Date()
  }), [prisonCellScene]);

  return {
    prisonCellCharacters,
    prisonCellScene,
    initialGameState
  };
}