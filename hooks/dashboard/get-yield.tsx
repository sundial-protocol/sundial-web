// this is very straigtforward for mvp - put in USD value, return percentage of that as ADA returns
export function getYield(value: number) {
  return 0.02 * value;
}
