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
 * @name SDL.ScrollableMessage
 * @desc ScrollableMessage module visual representation
 * @category View
 * @filesource app/view/sdl/shared/scrollableMessage.js
 * @version 1.0
 */

SDL.ScrollableMessage = SDL.SDLAbstractView.create(
  {
    elementId: 'ScrollableMessage',
    classNames: 'ScrollableMessage',
    classNameBindings: [
      'active:active'
    ],
    /**
     * Id of current request
     *
     * @type {Number}
     */
    messageRequestId: null,
    active: false,
    appID: null,
    timer: null,
    areImagesValid: true,
    timeout: null,
    childViews: [
      'backButton', 'captionText', 'softButtons', 'listOfCommands'
    ],
    /**
     * Deactivate View
     *
     * @param {Object} ABORTED Parameter to indicate status for
     *            UI.ScrollableMessageResponse
     */
    deactivate: function(ABORTED) {
      clearTimeout(this.timer);
      this.set('active', false);
      this.softButtons.set('page', 0);
      this.timeout = null;
      var resultCode = this.areImagesValid?SDL.SDLModel.data.resultCode.SUCCESS : SDL.SDLModel.data.resultCode.WARNINGS;
      if(ABORTED) {
        resultCode =SDL.SDLModel.data.resultCode.ABORTED;
      }

      SDL.SDLController.scrollableMessageResponse(
        resultCode, this.messageRequestId
      );
      SDL.SDLController.onSystemContextChange();
      SDL.SDLModel.data.registeredApps.forEach(app => {
        app.activeWindows.forEach(widget => {
          SDL.SDLController.onSystemContextChange(app.appID, widget.windowID);
        })
      })
    },
    activate: function(appName, params, messageRequestId) {
      if (appName) {
        var self = this;
        if (params.messageText.fieldName == 'scrollableMessageBody') {
          this.set('listOfCommands.items', params.messageText.fieldText);
        }
        this.set('messageRequestId', messageRequestId);
        this.set('captionText.content', appName);

        var is_png_image = function(file_name) {
          var search_offset = file_name.lastIndexOf('.');
          return file_name.includes('.png', search_offset);
        }
        
         this.set('areImagesValid',true);

        for (var i=0; i < params.softButtons.length; ++i) {
          var button = params.softButtons[i];
          if (!button.image) {
           continue;
          }
          var button_image = button.image;

          if (!is_png_image(button_image.value) && button_image.isTemplate) {
            this.set('areImagesValid',false);
          }
        }
    
        this.softButtons.addItems(params.softButtons, params.appID);
        this.set('active', true);
        this.set('cancelID', params.cancelID);
        clearTimeout(this.timer);
        this.timeout = params.timeout;
        this.timer = setTimeout(
          function() {
            self.deactivate();
          }, params.timeout
        );
      }
    },
    softButtons: SDL.MenuList.extend(
      {
        itemsOnPage: 4,
        groupName: 'ScrollableMessage',
        content: Em.ContainerView.extend(
          {
            classNames: [
              'content'
            ],
            attributeBindings: [
              'parentView.contentPositon:style'
            ]
          }
        )
      }
    ),
    /**
     * List for option on SDLOptionsView screen
     */
    listOfCommands: SDL.ScrollableText.extend(
      {
        elementId: 'scrollable_message_list',
        itemsOnPage: 11,
        /** Items array */
        items: 'asdasdasd',
        /**
         * Reset timeout function
         */
        click: function() {
          var self = this._parentView;
          clearTimeout(this._parentView.timer);
          SDL.SDLController.onResetTimeout(
            SDL.SDLController.model.appID, 'UI.ScrollableMessage'
          );
          this._parentView.timer = setTimeout(
            function() {
              self.deactivate();
            }, this._parentView.timeout
          );
        }
      }
    )
  }
);
