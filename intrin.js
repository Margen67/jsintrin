//"use strict";

const popcount1 = (function(){
  const _imul = Math.imul;
  return function(v) {
	v = ((v|0) - (((v >>> 1) & 0x55555555)|0))|0;                    // reuse input as temporary
	v = ((v & 0x33333333) + ((v >>> 2) & 0x33333333))|0;     // temp
	return (_imul(( (((v|0) + (v >>> 4))|0) & 0xF0F0F0F),0x1010101)) >>> 24; // count
};
})();

const umul = (function() {
	const _imul = Math.imul;
	return function(x,y) {
		return _imul(x >>>0, y>>>0)>>>0;
	};
})()

function udiv(x,y) {
	x >>>=0;
	y >>>=0;
	if(y != 0) {
		return ((x>>>0) / (y >>>0)) >>> 0;
	}
	else 
		return 0;
}

function idiv(x,y) {
	x |=0;
	y |=0;
	if(y != 0) {
		return ((x|0) / (y |0))|0;
	}
	else 
		return 0|0;
}

function rotl(value,count) {
	count |= 0;
	value >>>= 0
    return (value << count) | (value >>> (-count & 31))
}

function uadd(x, y) {
	return ((x >>> 0) + (y >>> 0)) >>> 0;
}
function uless(x, y) {
	return (x >>>0) < (y >>> 0);
}

const adcf = (function(){
	const _uadd = uadd;
	const _uless = uless;
	return function(x,y){
		return _uless(_uadd(x, y), x);
	};
	
})();
/*
	back when i first tried this with node v8 would always generate bit ands and 
	shifts for these operations but now it knows how to use movzx and movsx which removes 
	the 4 byte constants
*/
function zxu8(x) {
	return ((x&0xff) >>> 0);
}

function sxi8(x) {
	return (x << 24) >>24;
}
function sxi16(x) {
	return (x <<16) >> 16;
}

function zxu16(x) {
	return (x &0xffff) >>> 0;
}

/*
	Yeah... this doesnt get folded into sse code. i did notice though that the loop
	i tested codegen for with this function was unrolled by one iteration 
	
*/
const addu32x4 = (function() {

	const _Int32Array = Int32Array;
	
	return function(vx, howmuch, offset) {
		offset >>>= 0;
		howmuch >>>= 0;
		if(vx.constructor !== _Int32Array  ||(offset+4)>>>0 >= vx.length) {
			do{}while(1);
		}
		else 
		{
		let v0 = vx[offset>>>0], v1 = vx[(1+offset)>>>0], v2=vx[(2+offset)>>>0],v3=vx[(3+offset)>>>0] ;
		v0 = (v0+ howmuch)>>>0;
		v1 = (v1+ howmuch)>>>0;
		v2 = (v2+ howmuch)>>>0;
		v3 = (v3+ howmuch)>>>0;
		vx[offset>>>0] = v0; vx[(1+offset)>>>0] = v1; vx[(2+offset)>>>0] = v2; vx[(3+offset)>>>0] = v3;
		return 0;
		}
	};
})();

function bswap(x) {
	const v0 = x & 0xff;
	const v1 = (x >>>8) & 0xff;
	const v2 = (x >>>16) &0xff;
	const v3 = (x >>> 24) & 0xff;
	return (v3 | (v2 << 8) | (v1 << 16) | (v0 << 24)) >>>0;
}



/*
	Tried a few variants. This generated the best code. V8 still cant use bt,
	but with this variant it turns bit tests less than index 8 into single byte test instructions
	which use seven fewer bytes than the 32 bit variants saving code cache space
*/
function bt(x, i) {
	
	let sum = 0;
	sum = (sum + ((x & (1 << i)) != 0 ? 1 : 0))>>>0;
	return sum >>> 0;
}

function iszero_zflag(x) {
	x >>>= 0;
	return (x&x) == 0 ? 1 : 0;
}

function iszero_carryflag(x) {
	x >>>= 0;
	return adcf(~x, 1);
}


function shrd(r1, r2, count) {
	return (r1 >> count) | (r2 << (32 - count));
}
function generate_random_typedarray(type, howmany, multiplier) {
	let inputs = new Int32Array(howmany);

	for(let i = 0; i < howmany; ++i) {
	 inputs[i] = i *(Math.random()* multiplier);
	}
	return inputs;
}



const inps = generate_random_typedarray(Int32Array, 65535<<2, 87392);
let vals = [];


(function(){
	const _uadd = uadd;
	const _addu32x4 = addu32x4;
	for(let i = 0; i < inps.length >>> 3; i= (i+1) >>> 0) {
	_addu32x4(inps, 119>>>0, (i<<2)>>>0);
	//_addu32x4(inps, 119>>>0, _uadd((i<<3),  4));
	
}
return 0;
})();
