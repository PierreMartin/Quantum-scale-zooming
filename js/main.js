const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const canvas3 = document.getElementById('canvas3');
const descib = [document.getElementById('descib'), document.getElementById('descib2'), document.getElementById('descib3')];
const legend = [document.getElementById('legend'), document.getElementById('legend2'), document.getElementById('legend3')];
const percent = [document.getElementById('percent'), document.getElementById('percent2'), document.getElementById('percent3')];

let ctx = [];
let zooming = [1, 1e+10, 1e+17]; // TODO calculer ca
let limit = [1e+12, 1e+24, 1e+36]; // TODO calculer ca

const canvasArr = [
	{
		element: canvas1,
		initScale: 1e-33,
		initSizes: [
			{ unit: 1e+35, title: 'Ø: 1 meter' }, // 1m
			{ unit: 1e+34, title: 'Ø: 10 cm' }, // 0.1m
			{ unit: 1e+32, title: 'Ø: 1mm' }, // 0.001m
			{ unit: 1e+29, title: 'Ø: 0.001mm or 1e-6m' }, // 1e-6
			{ unit: 1e+28, title: 'Ø: 0.0001mm or 1e-7m' }, // 1e-7
			{ unit: 1e+27, title: 'Ø: 0.00001mm or 1e-8m' }, // 1e-8
			{ unit: 1e+26, title: 'Ø: 0.000001mm or 1e-9m' }, // 1e-9
			{ unit: 1e+25, title: 'Ø: atom (0.0000001mm or 100pm or 1e-10m' }, // 1e-10
		]
	},
	{
		element: canvas2,
		initScale: 1e-23,
		initSizes: [
			{ unit: 1e+25, title: 'Ø: atom (0.0000001mm or 100pm or 1e-10m' }, // 1e-10
			{ unit: 1e+24, title: 'Ø: 1e-11m' },
			{ unit: 1e+23, title: 'Ø: 1e-12m' },
			{ unit: 1e+22, title: 'Ø: 1e-13m' },
			{ unit: 1e+21, title: 'Ø: 1e-14m' },
			{ unit: 1e+20, title: 'Ø: 1e-15m' },
			{ unit: 1e+15, title: 'Ø: sub atom' },
			{ unit: 1e+11, title: 'Ø: sub atom' }
		]
	},
	{
		element: canvas3,
		initScale: 1e-9,
		initSizes: [
			{ unit: 1e+11, title: 'Ø: sub atom' },
			{ unit: 1e+9, title: 'Ø: sub atom' },
			{ unit: 100000, title: 'Ø: sub atom' },
			{ unit: 1000, title: 'Ø: sub atom' },
			{ unit: 1, title: 'Ø: Plank lengh' }
		]
	}
];

for (let i = 0; i < canvasArr.length; i++) {
	canvasArr[i].element.width = 800;
	canvasArr[i].element.height = 600;
}

const lastX = 800 / 2;
const lastY = 600 / 2;

window.onload = () => {
	for (let i = 0; i < canvasArr.length; i++) {
		initCanvas(canvasArr[i], i);
		draw(canvasArr[i], i);
		displayLegends(canvasArr[i], i);

		canvasArr[i].element.addEventListener('DOMMouseScroll', (evt) => {
			const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
			if (delta) zoom(delta, canvasArr[i], i);
			return evt.preventDefault() && false;
		}, false);

		canvasArr[i].element.addEventListener('mousewheel', (evt) => {
			const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
			if (delta) zoom(delta, canvasArr[i], i);
			return evt.preventDefault() && false;
		}, false);
	}
};

const initCanvas = (canvas, index) => {
	ctx[index] = canvas.element.getContext('2d');
	trackTransforms(ctx[index]);

	// Scale:
	const pt = ctx[index].transformedPoint(lastX, lastY);
	ctx[index].translate(pt.x, pt.y);
	ctx[index].scale(canvas.initScale, canvas.initScale);
	ctx[index].translate(-pt.x, -pt.y);
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

const draw = (canvas, index) => {
	// Clear the entire canvas
	const p1 = ctx[index].transformedPoint(0, 0);
	const p2 = ctx[index].transformedPoint(canvas.element.width, canvas.element.height);
	ctx[index].clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
	ctx[index].save();

	/*
	ctx[index].beginPath();
	ctx[index].lineWidth = 0.1;
	ctx[index].moveTo(400,350);
	ctx[index].lineTo(400,300);
	ctx[index].stroke();
	ctx[index].save();

	ctx[index].beginPath();
	ctx[index].translate(400, 300);
	ctx[index].lineWidth = 0.001;
	for (let i = 0; i < 360; i++) {
			ctx[index].rotate(i * Math.PI / 180);
			ctx[index].moveTo(1, 0);
			ctx[index].lineTo(0.1, 0);
			ctx[index].rotate(-1 * i * Math.PI / 180);
	}

	ctx[index].stroke();
	ctx[index].restore();
	*/

	for (let i = 0; i < canvas.initSizes.length; i++) {
		// ctx[index].font = '3000000px Arial';
		// ctx[index].fillText('Hello world', 400, 299);

		ctx[index].beginPath();
		ctx[index].strokeStyle = '#3540aa';
		ctx[index].lineWidth = canvas.initSizes[i].unit / 1000;
		ctx[index].arc(400, 300, canvas.initSizes[i].unit, 0, Math.PI * 2);
		ctx[index].stroke();
	}
};

displayLegends = (canvas, index) => {
	for (let i = 0; i < canvas.initSizes.length; i++) {
		if (1e+35 / canvas.initSizes[i].unit < zooming[index]) {
			descib[index].innerText = canvas.initSizes[i].title;
		}
	}

	legend[index].innerText = zooming[index].toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	percent[index].innerText = (zooming[index] / canvas.initSizes[0].unit) * 100;
};

const zoom = (clicks, canvas, index) => {
	const scaleFactor = 1.05;
	const pt = ctx[index].transformedPoint(lastX, lastY);
	const factor = Math.pow(scaleFactor, clicks);

	ctx[index].translate(pt.x, pt.y);
	ctx[index].scale(factor, factor);
	ctx[index].translate(-pt.x, -pt.y);

	zooming[index] *= factor;

	// Stop:
	if (zooming[index] > limit[index]) return;

	displayLegends(canvas, index);
	draw(canvas, index);
};
