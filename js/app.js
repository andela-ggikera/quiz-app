
/**
 * Author <Jee Githinji Gikera {githinjigikera@gmail.com}>
 * 
 * telequiz app.js 
 * 
 */
'use strict';
angular.module('telequiz', ['ngMaterial','ngAnimate', 'ngMdIcons','firebase'])
  .config(
     function ($mdThemingProvider, $mdIconProvider) {
       $mdThemingProvider.theme('altTheme').primaryPalette('brown');
       $mdIconProvider.defaultIconSet("assets/start.svg", 128)
     }
  );