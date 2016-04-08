"use strict";

/**
 * Promise.then with a precondition check.
 * This was made for a specific use case- error logging, when we want to see if a specific promise- and not promises it depends on- has failed.
 * @param {Promise} promise check this promise
 * @param {Array} conditions run Promise.all on these conditions, and make sure they are true before setting up a catch
 * @param resolveFn run this callback if preconditions happen and promise suceeds
 * @param rejectFn run this callback if preconditions happen and promise throws 
 * @param [conditionFailsValue] return this value if conditions not met
 */
function thenWhen(promise, conditions, resolveFn, rejectFn, conditionFailsValue){
	if(!promise){
		return Promise.reject(new Error("No promise"))
	}
	if((!resolveFn && !rejectFn) || !conditions){
		return promise
	}
	var
	  condition = conditions instanceof Array ? Promise.all(conditions) : Promise.resolve(conditions)
	  conditionFails = conditionFailsValue !== undefined ? function(){ return conditionFailsValue } : noop
	function conditionFails(){
		return conditionFailsValue
	}
	function resolve(val){
		return condition.then(function(){
			return resolveFn(val)
		}, conditionFails)
	}
	function reject(err){
		return condition.then(function(){
			return rejectFn(err)
		}, conditionFails)
	}
	return promise.then(resolveFn && resolve, rejectFn && reject)
}

function noop(){}

module.exports= function(promise, conditions, resolveFn, rejectFn){
	return module.exports.thenWhen(promise, conditions, resolveFn, rejectFn)
}
module.exports.thenWhen= thenWhen
