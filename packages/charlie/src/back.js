export default (part) => {
  // Helper method to draw the outseam path
  const drawOutseam = () => {
    let waistOut = points.styleWaistOut || points.waistOut
    let outseam = new Path()
      .move(points.styleWaistOut)
      .curve(points.seatOut, points.kneeOutCp2, points.floorOut)
    return new Path()
      .move(points.slantOut)
      .line(points.slantCurveStart)
      .curve(points.slantCurveCp1, points.slantCurveCp2, points.slantCurveEnd)
      .join(outseam.split(points.slantCurveEnd).pop())
      .reverse()
  }
  /*
   * Helper method to draw the outline path
   */
  const drawPath = () => {
    let waistIn = points.styleWaistIn || points.waistIn
    return drawOutseam()
      ._curve(points.backDartRightCp, points.backDartRight)
      .noop('dart')
      .line(points.backDartLeft)
      .curve(points.backDartLeftCp, points.cbCp, waistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .curve(points.forkCp2, points.kneeInCp1, points.floorIn)
  }

  // Shorthand
  let {
    points,
    Point,
    paths,
    Path,
    measurements,
    options,
    complete,
    paperless,
    store,
    macro,
    utils,
    snippets,
    Snippet,
    sa,
    raise,
    units
  } = part.shorthand()

  // Mark back pocket
  let base = points.styleWaistIn.dist(points.styleWaistOut)
  let angle = points.styleWaistIn.angle(points.styleWaistOut)
  store.set('backPocketToWaistband', base * options.backPocketVerticalPlacement)
  store.set('backPocketWidth', base * options.backPocketWidth)
  store.set('backPocketDepth', base * options.backPocketDepth)
  points.waistPocketCenter = points.styleWaistIn.shiftFractionTowards(
    points.styleWaistOut,
    options.backPocketHorizontalPlacement
  )
  points.pocketCenter = points.waistPocketCenter.shift(
    angle - 90,
    store.get('backPocketToWaistband')
  )
  points.pocketRight = points.pocketCenter.shift(angle, store.get('backPocketWidth') / 2)
  points.pocketLeft = points.pocketCenter.shift(angle, store.get('backPocketWidth') / -2)

  // Back dart
  points.tmp1 = points.waistPocketCenter.rotate(8.66, points.pocketCenter)
  points.tmp2 = points.waistPocketCenter.rotate(-8.66, points.pocketCenter)
  points.backDartLeft = points.pocketCenter.shiftFractionTowards(points.tmp1, 1.05)
  points.backDartRight = points.pocketCenter.shiftFractionTowards(points.tmp2, 1.05)
  let newBase =
    points.styleWaistIn.dist(points.backDartLeft) + points.styleWaistOut.dist(points.backDartRight)
  let delta = base - newBase
  // Adapt waist to new darted reality
  for (let p of ['styleWaistIn', 'crossSeamCurveStart', 'crossSeamCurveCp1']) {
    points[p] = points[p].shift(angle + 180, delta / 2)
  }
  points.styleWaistOut = points.styleWaistOut.shift(angle, delta / 2)

  // Helper object that holds the titan outseam path adapted for the dart
  const titanOutseam = new Path()
    .move(points.styleWaistOut)
    .curve(points.seatOut, points.kneeOutCp2, points.floorOut)

  // Keep the seat control point vertically between the (lowered) waist and seat line
  points.seatOutCp2.y = points.styleWaistOut.y + points.styleWaistOut.dy(points.seatOut) / 2

  // Construct pocket slant
  points.slantBottom = titanOutseam.shiftAlong(store.get('slantLength'))
  points.slantOut = points.styleWaistIn.shiftOutwards(points.styleWaistOut, store.get('slantWidth'))

  // Shape waist
  let dist = points.styleWaistOut.dist(points.waistPocketCenter) / 3
  points.cbCp = points.styleWaistIn
    .shiftTowards(points.crossSeamCurveStart, dist)
    .rotate(90, points.styleWaistIn)
  points.backDartLeftCp = points.backDartLeft
    .shiftTowards(points.pocketCenter, dist)
    .rotate(-90, points.backDartLeft)
  points.backDartRightCp = points.backDartRight
    .shiftTowards(points.pocketCenter, dist)
    .rotate(90, points.backDartRight)

  // Store waistband length
  store.set(
    'waistbandBack',
    new Path()
      .move(points.styleWaistIn)
      .curve(points.cbCp, points.backDartLeftCp, points.backDartLeft)
      .length() +
      new Path().move(points.backDartRight).curve_(points.backDartRightCp, points.slantOut).length()
  )
  store.set('legWidthBack', points.floorIn.dist(points.floorOut))

  // Round the slant
  points.slantCurveStart = points.slantBottom.shiftFractionTowards(
    points.slantOut,
    options.frontPocketSlantRound
  )
  points.slantCurveEnd = titanOutseam.shiftAlong(
    points.slantBottom.dist(points.slantCurveStart) + store.get('slantLength')
  )
  points.slantCurveCp1 = points.slantBottom.shiftFractionTowards(
    points.slantCurveStart,
    options.frontPocketSlantBend
  )
  points.slantCurveCp2 = titanOutseam.shiftAlong(
    points.slantBottom.dist(points.slantCurveCp1) + store.get('slantLength')
  )

  paths.saBase = drawPath()
  paths.seam = paths.saBase
    .insop('dart', new Path().line(points.pocketCenter))
    .close()
    .attr('class', 'fabric')
  paths.saBase.setRender(false)

  if (complete) {
    paths.pocketLine = new Path()
      .move(points.pocketLeft)
      .line(points.pocketRight)
      .attr('class', 'fabric dashed')
    points.titleAnchor = new Point(points.knee.x, points.fork.y)
    macro('title', {
      at: points.titleAnchor,
      nr: 1,
      title: 'back'
    })
    snippets.logo = new Snippet('logo', points.titleAnchor.shiftFractionTowards(points.knee, 0.5))
    points.slantBottomNotch = new Path()
      .move(points.slantCurveStart)
      .curve(points.slantCurveCp1, points.slantCurveCp2, points.slantCurveEnd)
      .intersectsY(points.slantBottom.y)
      .pop()
    points.slantTopNotch = points.slantOut.shiftTowards(
      points.slantCurveStart,
      store.get('slantTopNotchDistance')
    )
    macro('sprinkle', {
      snippet: 'bnotch',
      on: ['grainlineBottom', 'slantBottomNotch', 'slantTopNotch']
    })

    macro('bartack', {
      anchor: points.slantTopNotch,
      angle: points.slantTopNotch.angle(points.slantBottomNotch) - 90,
      length: sa ? sa / 2 : 5,
      suffix: 'slantTop'
    })
    macro('bartack', {
      anchor: points.slantBottomNotch,
      length: sa ? sa / 2 : 5,
      angle: 180,
      suffix: 'slantBottom'
    })

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .join(
          new Path()
            .move(points.floorIn)
            .line(points.floorOut)
            .offset(sa * 6)
        )
        .close()
        .attr('class', 'fabric sa')
    }
    raise.info(
      `Inseam height: ${units(points.fork.dy(points.floorIn))} | ` +
        `Waist: ${units((store.get('waistbandBack') + store.get('waistbandFront')) * 2)} | ` +
        `Bottom leg width: ${units((store.get('legWidthBack') + store.get('legWidthFront')) / 2)}`
    )

    if (paperless) {
    }
  }

  return part
}
