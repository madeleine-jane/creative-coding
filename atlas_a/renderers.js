
//Persist state in each renderer
//V1: single near and far color, each line color is lerped betwixt
//V2: shift the near and far color over time
//V3: also rave music starts playing


function setLineColors(lines, mouseCoords) {
    //sort from nearest mouse to furthest
    //lerp val = dist/furthest dist
    //lines[i].color = lerpColor()
    //return lines

    lines.sort(function (a, b) {
        return a.distanceToMouse(mouseCoords) - b.distanceToMouse(mouseCoords);
    });
    furthestLineDistance = lines[lines.length - 1].distanceToMouse(mouseCoords);

    for (let i = 0; i < lines.length; ++i) {
        if (raveMode) {
            lines[i].color = lerpColor(rave.colorCurrent, rave.complement(), lines[i].distanceToMouse(mouseCoords) / furthestLineDistance);
        } else {
            lines[i].color = color('black');
        }
    }

    return lines;

}

class StraightLineRenderer {
    constructor() {
        lineCount = 25;
    }
    render(pg, mouseCoords, linePointsLeft, linePointsRight) {
        let lines = [];
        for (let i = 0; i < linePointsLeft.length; ++i) {
            const lineStart = linePointsLeft[i];
            const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];
            lines.push(new Line(lineStart, lineEnd));
        }

        lines = setLineColors(lines, mouseCoords);
        for (let i = 0; i < lines.length; ++i) {
            lines[i].draw(pg);
        }
    }
}

class CurveRenderer {
    constructor() {
        lineCount = 50;
        this.maxCurveDistance = 50;
    }
    render(pg, mouseCoords, linePointsLeft, linePointsRight) {
        let lines = [];
        for (let i = 0; i < linePointsLeft.length; ++i) {
            const lineStart = linePointsLeft[i];
            const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];

            const newLine = new Line(lineStart, lineEnd);

            //determine which point along that line is closest to the mouse location
            const pointNearestMouse = linePointNearestToPoint(mouseCoords, newLine);

            //create a line between that point and the mouse location
            const lineToMouse = new Line(pointNearestMouse, mouseCoords);
            let curveDistance = lineLength(lineToMouse);

            if (lineLength(lineToMouse) > this.maxCurveDistance) {
                curveDistance = this.maxCurveDistance;
            }

            //create a point some distance along that line to be the control for the bezier curve
            const controlPoint = pointAlongLine(pointNearestMouse, mouseCoords, curveDistance);

            lines.push(new Curve(lineStart, lineEnd, controlPoint));
        }
        lines = setLineColors(lines, mouseCoords);
        for (let i = 0; i < lines.length; ++i) {
            lines[i].draw(pg);
        }
    }
}

class AnimatedCurveRenderer {
    constructor() {
        lineCount = 100;
        this.maxCurveDistance = 500;
        this.connectingLines = [];
    }

    //curves are regenerated if the mouse is being clicked. 
    //otherwise existing curves will do their thing
    generateConnectingCurves(mouseCoords, linePointsLeft, linePointsRight) {
        let newConnectingLines = [];
        for (let i = 0; i < linePointsLeft.length; ++i) {
            const lineStart = linePointsLeft[i];
            const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];

            const newLine = new Line(lineStart, lineEnd);

            //determine which point along that line is closest to the mouse location
            const pointNearestMouse = linePointNearestToPoint(mouseCoords, newLine);

            //create a line between that point and the mouse location
            const lineToMouse = new Line(pointNearestMouse, mouseCoords);
            let curveDistance = lineLength(lineToMouse);

            if (lineLength(lineToMouse) > this.maxCurveDistance) {
                curveDistance = this.maxCurveDistance;
            }
            //create a point some distance along that line to be the control for the bezier curve
            const controlPoint = pointAlongLine(pointNearestMouse, mouseCoords, curveDistance);

            newConnectingLines.push(new AnimatedCurve(lineStart, lineEnd, controlPoint, pointNearestMouse));
        }
        return newConnectingLines;
    }

    render(pg, mouseCoords, linePointsLeft, linePointsRight) {
        if (mouseIsPressed || this.connectingLines.length == 0) {
            this.connectingLines = this.generateConnectingCurves(mouseCoords, linePointsLeft, linePointsRight);
        }
        this.connectingLines = setLineColors(this.connectingLines, mouseCoords);
        for (let i = 0; i < this.connectingLines.length; ++i) {
            this.connectingLines[i].advance();
            this.connectingLines[i].draw(pg);
        }
    }
}
