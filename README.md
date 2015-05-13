##decl-transclude
###multi element transclude for angular - to be more declarative

Transclude multiple elements to declare your own readable interface e.g. you can build a reusable form and
allow others to define the variable parts:

````html
<div my-form decl-transclude>
    <my-form-title>This is a title from outer scope</my-form-title>
    <my-form-info ng-if="!$form.$valid">The form is invalid!</my-form-info>
    <my-form-button-title>Yes!</my-form-button-title>
</div>
````

##Installation
````
bower install decl-transclude
````

##Usage

Place the `decl-transclude` directive on the element which does contain the elements you want to transclude:

````html
<div my-form decl-transclude>...</div>
````

Register your elements via the `declRegistryProvider`:
````javascript
appModule.config(function (declRegistryProvider) {
         declRegistryProvider.register([
            'myFormTitle',
            'myFormInfo',
            'myFormButtonTitle',
            'myFormCancelTitle',
            'myFormHelpText'
        ]);
    });
````
this will discover elements having the registered name as tag-name or as attribute. So both are the same:

````html
<div my-form-title>...</div>
<my-form-title>...</my-form-title>
````

finally transclude the elements in your template of the directive with `decl-transclude-from`:

````html
<form name="myForm" class="my-form">
    <h4 decl-transclude-from="my-form-title"></h4>
    <input type="text" ng-model="form.data" required>
    <p decl-transclude-from="my-form-info" transclude-locals="{$form: myForm}"></p>
    <div class="footer">
        <button type="submit" decl-transclude-from="my-form-button-title"></button>
        <button type="button" decl-transclude-from="my-form-cancel-title">Default Cancel</button>
    </div>
</form>
````
by using `transclude-locals` you can define variables available to the transcluded element.

If you don't want to register elements you can use the predefined `decl-transclude-as` attribute instead:

````html
<div my-form decl-transclude>
    <div decl-transclude-as="my-form-title">This is a title from outer scope</div>
    <div decl-transclude-as="my-form-info" ng-if="!$form.$valid">The form is invalid!</div>
    <div decl-transclude-as="my-form-button-title">Yes!</div>
</div>
````

you can define a default content e.g.
````html
<button type="button" decl-transclude-from="my-form-cancel-title">Default Cancel</button>
````
will give a button with the caption "Default Cancel" as long as no `my-form-cancel-title` element is given.

if you wish, you can trigger which content to use with `or-default-if` (the expression is currently only evaluated once in the linking phase - no watching) e.g.
````html
<my-form-help-text or-default-if="someStaticCondition()">This will only show when someStaticCondition() is false</my-form-help-text>
````
will transclude the given content only if `someStaticCondition()` evaluates to false.