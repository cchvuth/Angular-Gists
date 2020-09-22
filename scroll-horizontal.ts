export function scrollHorizontal(ele: any, direction: string, scrollAmount: number = 300, setScrollTo?: number) {
  let currentScroll = ele.scrollLeft;
  const scroll =
    setScrollTo != null ? setScrollTo : direction === 'left' ? (currentScroll -= scrollAmount) : (currentScroll += scrollAmount);

  if (ele.scroll) {
    ele.scroll({
      left: scroll,
      behavior: 'smooth'
    });
  } else {
    ele.scrollLeft = scroll;
  }
}
