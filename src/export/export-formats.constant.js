'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.export.ExportFormats
 * @description
 * # ExportFormats
 * Event export formats
 */
angular
  .module('udb.export')
  .constant('ExportFormats',
  /**
   * Enum for export formats
   * @readonly
   * @enum {string}
   */
  {
    OOXML: {
      type: 'ooxml',
      extension: 'xlsx',
      label: 'Office Open XML (Excel)',
      description: 'Het standaard formaat van Excel vanaf Microsoft Office 2007.'
    },
    PDF: {
      type: 'pdf',
      label: 'Als PDF',
      extension: 'pdf',
      description: 'Druk snel en eenvoudig items uit de UiTdatabank af. Kies een Vlieg, UiT-, of UiTPAS-sjabloon.',
      customizable: true
    },
    JSON: {
      type: 'json',
      label: 'Als json',
      extension: 'json',
      description: 'Exporteren naar event-ld om de informatie voor ontwikkelaars beschikbaar te maken.'
    }
  });
