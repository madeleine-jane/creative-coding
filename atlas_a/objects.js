
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
    }
    draw(pg) {
        pg.line(this.origin.x, this.origin.y, this.dest.x, this.dest.y);
    }
}

class Curve {
    constructor(origin, dest, control) {
        this.origin = origin;
        this.dest = dest;
        this.control = control;
    }
    draw(pg) {
        pg.noFill();
        pg.beginShape();
        pg.vertex(this.origin.x, this.origin.y);           // move to start
        pg.quadraticVertex(this.control.x, this.control.y, this.dest.x, this.dest.y); // curve
        pg.endShape();
    }
}

class AnimatedCurve {
    constructor(origin, dest, control, target) {
        this.originPoint = origin;
        this.destPoint = dest;
        this.currentControlPoint = control;
        this.controlTargetPoint = target;
        this.fallDistance = 1;

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
        pg.noFill();
        pg.beginShape();
        pg.vertex(this.originPoint.x, this.originPoint.y);
        pg.quadraticVertex(this.currentControlPoint.x, this.currentControlPoint.y, this.destPoint.x, this.destPoint.y); // curve
        pg.endShape();
    }
}