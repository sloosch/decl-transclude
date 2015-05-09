##decl-transclude
###multi element transclude for angular - to be more declarative

Transclude multiple elements into different places.

##Installation
````
bower install decl-transclude
````

##Usage

Place the 'decl-transclude' directive on the element which does contain the elements which you want to transclude:
````html
<div some-directive decl-transclude>...</div>
````
Give every element a name with 'decl-transclude-as' so it can be later referenced:
````html
<div some-directive decl-transclude>
    <div decl-transclude-as="foo">Lorem ipsum</div>
</div>
````

In the Template of your directive place 'decl-transclude-from' to transclude an element into your directive:
````html
<div class="some-directive">
    <div decl-transclude-from="foo"></div>
</div>
````


You may define locals for the transcluded scope which then can be used by the element being transcluded:
<sub>in the "main"-template</sub>
````html
<div some-directive decl-transclude>
    <div decl-transclude-as="bar">This is {{$some}} from the directive transcluding me!</div>
</div>
````
<sub>in the template of the directive</sub>
````html
<div class="some-directive">
    <div decl-transclude-from="bar" transclude-locals="{$some: 'r2d2'}"></div>
</div>
````


Mixing with 'ngTransclude' is possible:
<sub>in the "main"-template</sub>
````html
<div some-directive decl-transclude>
    <div decl-transclude-as="quux">higgs</div>
    <div>this can be transcluded with ngTransclude</div>
</div>
````
<sub>in the template of the directive</sub>
````html
<div class="some-directive">
    <div ng-transclude></div>
    <div decl-transclude-from="quux"></div>
</div>
````
