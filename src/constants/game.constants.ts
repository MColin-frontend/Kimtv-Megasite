const GAME_ABBR_TO_ID: Record<string, number> = {
  soccer: 202,
  basketball: 201,
  cricket: 210,
  tennis: 211,
  snooker: 204,
  baseball: 213,
  football: 217,
  volleyball: 214,
  "table-tennis": 216,
  badminton: 215,
  comprehensive: 200,
} as const

export { GAME_ABBR_TO_ID }
