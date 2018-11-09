const canvas = document.getElementById('canvas');
const canvas2 = document.getElementById('canvas2');
const legend = document.getElementById('legend');
const percent = document.getElementById('percent');
const legend2 = document.getElementById('legend2');
const percent2 = document.getElementById('percent2');

const initScales = [ // -2 from initSizes
	1e-33,
	1e-21
];
const initSizes = [ // TODO mettre arr d'object
	1e+35, // 1m
	1e+34, // 10cm
	1e+25, // atom
	1e+23, // end
];

let ctx;

const canvasArr = [
	{
		element: canvas,
		initScale: 1e-33,
		initSizes: [
			1e+35, // 1m
			1e+34, // 10cm
			1e+25, // atom
			1e+23, // end
		]
	},
	{
		element: canvas2,
		initScale: 1e-21,
		initSizes: [
			1e+35, // 1m
			1e+34, // 10cm
			1e+25, // atom
			1e+23, // end
		]
	}
];

let zooming = 1;
canvas.width = 800;
canvas.height = 600;
const lastX = canvas.width / 2;
const lastY = canvas.height / 2;

window.onload = () => {
	/*
	for (let i = 0; i < canvasArr.length; i++) {
		init(canvasArr[i]);
		draw(canvasArr[i]);

		canvasArr[i].element.addEventListener('DOMMouseScroll', handleScroll, false);
		canvasArr[i].element.addEventListener('mousewheel', handleScroll, false);
	}
	*/

	init();
	draw();

	canvas.addEventListener('DOMMouseScroll', handleScroll, false);
	canvas.addEventListener('mousewheel', handleScroll, false);
};

const init = () => {
	ctx = canvas.getContext('2d');
	trackTransforms(ctx);

	// Scale:
	const pt = ctx.transformedPoint(lastX, lastY);
	ctx.translate(pt.x, pt.y);
	ctx.scale(initScales[0], initScales[0]);
	ctx.translate(-pt.x, -pt.y);
};

const trackTransforms = (ctx) => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	let xform = svg.createSVGMatrix();
	// ctx.getTransform = () => xform;

	const savedTransforms = [];
	const save = ctx.save;
	ctx.save = () => {
		savedTransforms.push(xform.translate(0, 0));
		return save.call(ctx);
	};

	const restore = ctx.restore;
	ctx.restore = () => {
		xform = savedTransforms.pop();
		return restore.call(ctx);
	};

	const scale = ctx.scale;
	ctx.scale = (sx, sy) => {
		xform = xform.scaleNonUniform(sx, sy);
		return scale.call(ctx, sx, sy);
	};

	const translate = ctx.translate;
	ctx.translate = (dx, dy) => {
		xform = xform.translate(dx, dy);
		return translate.call(ctx, dx, dy);
	};

	const pt = svg.createSVGPoint();
	ctx.transformedPoint = (x, y) => {
		pt.x = x;
		pt.y = y;
		return pt.matrixTransform(xform.inverse());
	}
};

const draw = () => {
	// Clear the entire canvas
	const p1 = ctx.transformedPoint(0, 0);
	const p2 = ctx.transformedPoint(canvas.width, canvas.height);
	ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
	ctx.save();

	/*
	ctx.beginPath();
	ctx.lineWidth = 0.1;
	ctx.moveTo(400,350);
	ctx.lineTo(400,300);
	ctx.stroke();
	ctx.save();

	ctx.beginPath();
	ctx.translate(400, 300);
	ctx.lineWidth = 0.001;
	for (let i = 0; i < 360; i++) {
			ctx.rotate(i * Math.PI / 180);
			ctx.moveTo(1, 0);
			ctx.lineTo(0.1, 0);
			ctx.rotate(-1 * i * Math.PI / 180);
	}

	ctx.stroke();
	ctx.restore();
	*/

	for (let i = 0; i < initSizes.length; i++) {
		// ctx.font = '3000000px Arial';
		// ctx.fillText('Hello world', 400, 299);

		ctx.beginPath();
		ctx.strokeStyle = '#3540aa';
		ctx.lineWidth = initSizes[i] / 1000;
		ctx.arc(400, 300, initSizes[i], 0, Math.PI * 2);
		ctx.stroke();
	}
};

const zoom = (clicks) => {
	const scaleFactor = 1.05;
	const pt = ctx.transformedPoint(lastX, lastY);
	const factor = Math.pow(scaleFactor, clicks);

	ctx.translate(pt.x, pt.y);
	ctx.scale(factor, factor);
	ctx.translate(-pt.x, -pt.y);

	zooming *= factor;

	// Stop:
	if (zooming > 1e+12) return;

	legend.innerText = zooming.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	percent.innerText = (zooming / initSizes[0]) * 100;
	draw();
};

const handleScroll = (evt) => {
	const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
	if (delta) zoom(delta);
	return evt.preventDefault() && false;
};
