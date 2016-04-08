#!/usr/bin/env node
var
  tape= require("tape"),
  thenWhen= require("..")

tape("Normative case, condition suceeds", function(t){
	t.plan(3)
	var
	  condition= Promise.resolve(),
	  testee= Promise.defer()
	thenWhen(testee.promise, condition, function(val){
		t.equal(val, "ok", "Resolved value 'ok' found")
		t.ok("Condition passed, passed in function invoked")
		return "good"
	}, function(){
		t.fail("Condition should have passed")
	}).then(function(val){
		t.equal(val, "good", "Passed through value 'good' found")
	}, function(){
		t.fail("ThenWhen should have succeeded")
	})
	testee.resolve("ok")
})

tape("Condition fails", function(t){
	t.plan(1)
	var
	  condition= Promise.reject(),
	  testee= Promise.defer()
	thenWhen(testee.promise, condition, function(){
		t.fail("Condition should have failed, skipping then")
	}, function(){
		t.fail("Condition should have failed, skipping catch")
	}).then(function(val){
		t.notOk(val, "Condition failed, so silent return from thenWhen")
	}, function(){
		t.fail("Condition failed, so thenWhen going to silently pass")
	})
	testee.resolve(666)
})

tape("original promise fails", function(t){
	t.plan(1)
	var
	  condition= Promise.resolve(),
	  testee= Promise.reject("nope")
	thenWhen(testee, condition, function(){
		t.fail("Should have failed")
	}, function(err){
		t.equal(err, "nope", "Properly rejected because original failed")
	})
})

tape("Multiple conditions work", function(t){
	t.plan(2)
	var
	  conditionA= Promise.resolve(),
	  conditionB= Promise.defer(),
	  testee= Promise.resolve(42),
	  canary= false,
	  retained= thenWhen(testee, [conditionA, conditionB.promise], function(val){
		canary= 1
		t.equal(val, 42, "Found resolved value '42'")
	  })
	setTimeout(function(){
		t.notOk(canary, "expected testee to not have been triggered yet")
		conditionB.resolve()
	}, 40)
})
