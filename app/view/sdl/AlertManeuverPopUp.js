/*
 * Copyright (c) 2013, Ford Motor Company All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *  · Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *  · Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *  · Neither the name of the Ford Motor Company nor the names of its
 * contributors may be used to endorse or promote products derived from this
 * software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @name SDL.AlertManeuverPopUp
 * @desc AlertManeuverPopUp module visual representation
 * @category View
 * @filesource app/view/sdl/AlertManeuverPopUp.js
 * @version 1.0
 */

SDL.AlertManeuverPopUp = Em.ContainerView.create(
  {
    elementId: 'AlertManeuverPopUp',
    classNames: 'AlertManeuverPopUp',
    classNameBindings: [
      'activate:AlertManeuverActive'
    ],
    childViews: [
      'applicationName',
      // 'image',
      // 'message1',
      // 'message2',
      // 'message3',
      'softbuttons',
      'closeButton'
    ],
    content1: 'Title',
    content2: 'Text',
    activate: false,
    areImagesValid: true,
    timer: null,
    /**
     * Wagning image on Alert Maneuver PopUp
     */
    image: Em.View.extend(
      {
        elementId: 'alertManeuverPopUpImage',
        classNames: 'alertManeuverPopUpImage'
      }
    ),
    applicationName: SDL.Label.extend(
      {
        elementId: 'applicationName',
        classNames: 'applicationName',
        contentBinding: 'parentView.appName'
      }
    ),
    message1: SDL.Label.extend(
      {
        elementId: 'message1',
        classNames: 'message1',
        contentBinding: 'parentView.content1'
      }
    ),
    message2: SDL.Label.extend(
      {
        elementId: 'message2',
        classNames: 'message2',
        contentBinding: 'parentView.content2'
      }
    ),
    message3: SDL.Label.extend(
      {
        elementId: 'message3',
        classNames: 'message3',
        contentBinding: 'parentView.content3'
      }
    ),
    /**
     * Container for softbuttons
     */
    softbuttons: Em.ContainerView.extend(
      {
        elementId: 'alertManeuverSoftButtons',
        classNames: 'alertManeuverSoftButtons'
      }
    ),
    /**
     * Close button
     */
    closeButton: SDL.Button.create(
      {
        text: 'Close',
        classNames: 'closeButton softButton',
        action: 'closeAlertMeneuverPopUp',
        target: 'SDL.SDLController',
        templateName: 'text'
      }
    ),
    /**
     * @desc Function creates Soft Buttons on AlertPoUp
     * @param {Object} params
     */
    addSoftButtons: function(params) {
      var count = this.get('softbuttons').removeAllChildren();
      if (params) {
        var softButtonsClass;
        switch (params.length) {
          case 1:
            softButtonsClass = 'one';
            break;
          case 2:
            softButtonsClass = 'two';
            break;
          case 3:
            softButtonsClass = 'three';
            break;
          case 4:
            softButtonsClass = 'four';
            break;
        }

        var is_png_image = function(file_name) {
          var search_offset = file_name.lastIndexOf('.');
          return file_name.includes('.png', search_offset);
        }

        for (var i = 0; i < params.length; i++) {
          this.get('softbuttons.childViews').pushObject(
            SDL.Button.create(
              SDL.PresetEventsCustom, {
                softButtonID: params[i].softButtonID,
                icon: params[i].image,
                text: params[i].text,
                classNames: 'list-item softButton ' + softButtonsClass,
                elementId: 'softButton' + i,
                templateName: params[i].image ? 'rightIcon' : 'text',
                systemAction: params[i].systemAction,
                appID: params.appID
              }
            )
          );
          if (params[i].image==null){
            continue;
          }
          if (!is_png_image(params[i].image.value) && params[i].image.isTemplate) {
              this.set('areImagesValid',false);
            }
        }
      }
    },
    AlertManeuverActive: function(message) {
      var self = this;
      var params = message.params;
      this.set('areImagesValid',true);
      if (params.softButtons) {
          this.addSoftButtons( params.softButtons );
      }

      this.set( 'activate', true );

      clearTimeout( this.timer );
      var self = this;
      this.timer = setTimeout( function() {
          self.set( 'activate', false );
          var resultCode = self.areImagesValid?SDL.SDLModel.data.resultCode.SUCCESS : SDL.SDLModel.data.resultCode.WARNINGS;
          FFW.Navigation.sendNavigationResult(
            resultCode,
            message.id,
            message.method
          );
      }, 5000 );
    }
  }
);
