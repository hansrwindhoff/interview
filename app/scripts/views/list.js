/*global define, jQuery */

// these definitions files are only usefullin Visual studio code
// other IDEs/editors will ignore this, but in VSCode intellisense in JS libraries is available with these
/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/backbone/backbone.d.ts" />

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'collections/note',
    'models/note',
    'views/edit',
    'jqueryui'
], function(jQuery, _, Backbone, JST, NoteCollection, NoteModel, EditView, ui) {
    'use strict';

    var NoteListView = Backbone.View.extend({
        template: JST['app/scripts/templates/list.ejs'],
        modalTemplate: JST['app/scripts/templates/note.ejs'],

        collection: new NoteCollection(),

        editView: null,

        $modalEl: null,

        events: {
            "click #create": "create" // create a note
                ,
            "click a.note": "edit",
            "click button.deletenote": "delete",
            "click #clear": "clear" // clear all notes
                ,
            "click #sortTitleUp": "sortTitleUp",
            "click #sortTitleDown": "sortTitleDown"
        },

        updowncompare : function(updown){// true is up
           return  function compare(a, b) {
            var xtitle =  updown ? a.get('title'):b.get('title');
            var ytitle =  updown ? b.get('title'):a.get('title');

            if (xtitle < ytitle) {
                return -1;
            }
            if (xtitle > ytitle) {
                return 1;
            }
            // a must be equal to b
            return 0;
          };
        },

        sortTitleDown: function() {
          this.collection.comparator =this.updowncompare(false);
          this.collection.sort();

        },
        sortTitleUp: function() {
            this.collection.comparator = this.updowncompare(true);
            this.collection.sort();
        },


        create: function() {
            var self = this;

            this.editView = new EditView({
                el: self.$modalEl,
                collection: self.collection,
                model: new NoteModel()
            });
        },
        clear: function() {

            if (confirm("Ok to delete all notes from the list?")) {
                this.collection.reset();
                this.collection.save();
            }
        },

        delete: function(event) {

           var noteId = jQuery(event.target).data('note-id'),
                note = this.collection.get(noteId);
            if (note) {
                if (confirm("Ok to delete this note? Title: " + note.get('title'))) {
                    this.collection.remove(note);
                    this.collection.save();
                }
            }

        },
        edit: function(event) {
            var self = this,
                noteId = jQuery(event.target).data('note-id'),
                note = this.collection.get(noteId);

            this.editView = new EditView({
                el: self.$modalEl,
                collection: self.collection,
                model: note
            });

        },

        initialize: function(options) {
            var self = this;

            this.$modalEl = jQuery(options.modalEl);

            this.collection.fetch({
                complete: function() {
                    self.render();
                }
            });

            this.collection.on('all', function() {
                self.render();
            });
            this.collection.comparator = this.updowncompare(true);
            this.collection.sort();
        },

        render: function() {
            var self = this;

            this.$el.html(this.template({
                notes: self.collection
            }));
        }
    });

    return NoteListView;
});
