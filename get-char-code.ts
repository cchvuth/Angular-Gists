export function getCharCodeFromEvent(event) {
  return event.which ? event.which : event.keyCode;
}
