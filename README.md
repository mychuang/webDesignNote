# A simple web App design 
## Install & construct NPM ENV with jQuery
```
npm init //generate package.json

npm inatall

npm install jquery-ui-dist

npm install jquery
```
refer: https://stackoverflow.com/questions/34219046/using-npm-install-to-install-jquery-ui

## Install & construct TypeSript ENV.
```
 npm install -g typescript
 tsc --init
```

## Install jQuery for TypeScript
- if use jquery-ui, just install @types/jqueryui
```
npm install --save @types/jqueryui
```
- if we don't use jQuery-ui, just install jQuery
```
npm install @types/jquery --save-dev
```

## Install BootStrap for TypeScript
```
npm install -D @types/bootstrap
```