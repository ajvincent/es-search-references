export function hasPositiveArea(
  element: HTMLElement
): boolean
{
  const rect = element.getBoundingClientRect();
  return rect.width * rect.height > 0;
}
