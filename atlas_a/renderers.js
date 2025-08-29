
class StraightLineRenderer {
    render(pg, mouseCoords, linePointsLeft, linePointsRight) {
        for (let i = 0; i < linePointsLeft.length; ++i) {
            const lineStart = linePointsLeft[i];
            const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];

            const newLine = new Line(lineStart, lineEnd);

            //determine which point along that line is closest to the mouse location
            const pointNearestMouse = linePointNearestToPoint(mouseCoords, newLine);

            if (i < linePointsLeft.length / 2) {
                // pointNearestMouse.draw(pg);
            }
            newLine.draw(pg);
        }
    }
}

class CurveRenderer {
    constructor() {
        this.maxCurveDistance = 50;
    }
    render(pg, mouseCoords, linePointsLeft, linePointsRight) {
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

            const newCurve = new Curve(lineStart, lineEnd, controlPoint);
            newCurve.draw(pg);
        }
    }
}

class AnimatedCurveRenderer {
    constructor() {
        this.maxCurveDistance = 500;
        this.connectingLines = [];
    }

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
        //draw lines between the points
        if (mouseIsPressed || this.connectingLines.length == 0) { //length is 0 on startup
            this.connectingLines = this.generateConnectingCurves(mouseCoords, linePointsLeft, linePointsRight);
        }
        for (let i = 0; i < this.connectingLines.length; ++i) {
            this.connectingLines[i].advance();
            this.connectingLines[i].draw(pg);
        }
    }
}
