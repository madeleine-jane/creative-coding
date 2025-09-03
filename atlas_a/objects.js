
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(pg) {
        pg.circle(this.x, this.y, 5);
    }
}

class Line {
    constructor(origin, dest) {
        this.origin = origin;
        this.dest = dest;
        this.color = color('black');
    }
    draw(pg) {
        pg.stroke(this.color);
        pg.line(this.origin.x, this.origin.y, this.dest.x, this.dest.y);
    }
    //finds the point on the line nearest to the mouse coordinates, and then returns distance from that point to the mouse
    distanceToMouse(mouseCoords) {
        return lineLength(new Line(mouseCoords, linePointNearestToPoint(mouseCoords, this)));
    }
}

class Curve {
    constructor(origin, dest, control) {
        this.origin = origin;
        this.dest = dest;
        this.control = control;
        this.color = color('black');
    }
    draw(pg) {
        pg.stroke(this.color);
        pg.noFill();
        pg.beginShape();
        pg.vertex(this.origin.x, this.origin.y);           // move to start
        pg.quadraticVertex(this.control.x, this.control.y, this.dest.x, this.dest.y); // curve
        pg.endShape();
    }
    //just calculate distance based on if it was straight instead of curved, plotting on a curve sounds hard
    distanceToMouse(mouseCoords) {
        const baseLine = new Line(this.origin, this.dest);
        return baseLine.distanceToMouse(mouseCoords);
    }
}

class AnimatedCurve {
    constructor(origin, dest, control, target) {
        this.origin = origin;
        this.dest = dest;
        this.currentControlPoint = control;
        this.controlTargetPoint = target;
        this.fallDistance = 1;
        this.color = color('black');

    }
    advance() {
        const distToTarget = lineLength(new Line(this.currentControlPoint, this.controlTargetPoint));
        if (distToTarget < 1) {
            return;
        }
        this.currentControlPoint = pointTowards(this.currentControlPoint, this.controlTargetPoint, min(distToTarget, this.fallDistance));
        this.fallDistance += 0.75;

    }
    draw(pg) {
        pg.stroke(this.color);
        pg.noFill();
        pg.beginShape();
        pg.vertex(this.origin.x, this.origin.y);
        pg.quadraticVertex(this.currentControlPoint.x, this.currentControlPoint.y, this.dest.x, this.dest.y); // curve
        pg.endShape();
    }
    //just calculate distance based on if it was straight instead of curved, plotting on a curve sounds hard
    distanceToMouse(mouseCoords) {
        const baseLine = new Line(this.origin, this.dest);
        return baseLine.distanceToMouse(mouseCoords);
    }
}


class Rave {
    constructor() {
        this.raveColors = [
            color(255, 0, 242), //pink
            color(0, 255, 0), //green
            color(115, 0, 255), //cool purple
            color(255, 89, 0), //orange
        ];
        this.advanceAmount = 4;

        //colorCurrent advances towards colorTarget until it hits it. 
        //then colorTarget switches to a new value. 
        this.colorCurrent = color('red');
        this.colorTarget = color('blue');
    }

    randomColor() {
        return this.raveColors[Math.floor(Math.random() * this.raveColors.length)];
    }

    colorsEqual(a, b) {
        return red(a) == red(b) && blue(a) == blue(b) && green(a) == green(b);
    }

    complement() {
        return rgbToComplement(red(this.colorCurrent), green(this.colorCurrent), blue(this.colorCurrent));
    }

    advanceChannel(currentVal, targetVal) {
        const amountToAdvance = Math.min(this.advanceAmount, Math.abs((currentVal - targetVal)));
        if (currentVal > targetVal) {
            return currentVal - amountToAdvance;
        } else {
            return currentVal + amountToAdvance;
        }
    }

    advanceCurrentColor(current, target) {
        return color(this.advanceChannel(red(current), red(target)), this.advanceChannel(green(current), green(target)), this.advanceChannel(blue(current), blue(target)));
    }

    advanceColors() {
        this.colorCurrent = this.advanceCurrentColor(this.colorCurrent, this.colorTarget);
        if (this.colorsEqual(this.colorCurrent, this.colorTarget)) {
            this.colorTarget = this.randomColor();
        }
    }
}
