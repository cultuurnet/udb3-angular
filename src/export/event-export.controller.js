'use strict';

/**
 * @ngdoc function
 * @name udb.export.controller:EventExportController
 * @description
 * # EventExportController
 * Controller of the udb.export
 */
angular
  .module('udb.export')
  .controller('EventExportController', EventExportController);

/* @ngInject */
function EventExportController($uibModalInstance, eventExporter, ExportFormats, udbApi, appConfig) {

  var exporter = this;

  exporter.exportLogoUrl = appConfig.exportLogoUrl;

  exporter.dayByDay = false;

  exporter.eventProperties = [
    {name: 'name', include: true, sortable: false, excludable: false},
    {name: 'description', include: false, sortable: false, excludable: true},
    {name: 'labels', include: false, sortable: false, excludable: true},
    {name: 'calendarSummary', include: true, sortable: false, excludable: false},
    {name: 'image', include: false, sortable: false, excludable: true},
    {name: 'videos', inclue: false, sortable: false, excludable: true},
    {name: 'location', include: true, sortable: false, excludable: false},
    {name: 'address', include: true, sortable: false, excludable: true},
    {name: 'organizer', include: false, sortable: false, excludable: true},
    {name: 'priceInfo', include: false, sortable: false, excludable: true},
    {name: 'kansentarief', include: false, sortable: false, excludable: true, format: ExportFormats.OOXML},
    {name: 'contactPoint', include: false, sortable: false, excludable: true},
    {name: 'bookingInfo', include: false, sortable: false, excludable: true},
    {name: 'status', include: false, sortable: false, excludable: true},
    {name: 'bookingAvailability', include: false, sortable: false, excludable: true},
    {name: 'attendance', include: false, sortable: false, excludable: true},
    {name: 'creator', include: false, sortable: false, excludable: true},
    {name: 'terms.theme', include: true, sortable: false, excludable: true},
    {name: 'terms.eventtype', include: true, sortable: false, excludable: true},
    {name: 'created', include: false, sortable: false, excludable: true},
    {name: 'modified', include: false, sortable: false, excludable: true},
    {name: 'available', include: false, sortable: false, excludable: true},
    {name: 'endDate', include: false, sortable: false, excludable: true},
    {name: 'startDate', include: false, sortable: false, excludable: true},
    {name: 'calendarType', include: false, sortable: false, excludable: true},
    {name: 'sameAs', include: false, sortable: false, excludable: true},
    {name: 'typicalAgeRange', include: false, sortable: false, excludable: true},
    {name: 'language', include: false, sortable: false, excludable: true},
    {name: 'audience', include: false, sortable: false, excludable: true, format: ExportFormats.OOXML},
    {name: 'completeness', include: false, sortable: false, excludable: true}
  ];

  exporter.exportFormats = _.map(ExportFormats);

  exporter.brands = appConfig.exportBrands;
  exporter.restrictedBrands = appConfig.restrictedExportBrands;
  exporter.templateUrl = appConfig.exportTemplateUrl;
  exporter.templates = appConfig.exportTemplateTypes;

  udbApi.getMyRoles().then(function(roles) {
    angular.forEach(roles, function(value, key) {
      exporter.brands = exporter.brands.concat(_.where(exporter.restrictedBrands, {role : roles[key].uuid}));
    });
  });

  exporter.customizations = {
    brand: '',
    logo: exporter.exportLogoUrl + exporter.brands[0].logo,
    title: '',
    subtitle: '',
    footer: '',
    publisher: '',
    template: ''
  };

  /**
   * A map of all the possible export steps.
   * You can add a callback to its incomplete property which will be used to check if a step is completed.
   */
  exporter.exportSteps = {
    format: {
      name: 'format',
      incomplete: function () {
        var format = exporter.format,
            isCustomizable = !!_.find(exporter.exportFormats, {type: format, customizable: true});

        if (isCustomizable) {
          exporter.steps = [
            exporter.exportSteps.format,
            exporter.exportSteps.customize,
            exporter.exportSteps.confirm
          ];
        } else {
          exporter.steps = [
            exporter.exportSteps.format,
            exporter.exportSteps.filter,
            exporter.exportSteps.confirm
          ];
        }

        return !format;
      }
    },
    customize: {
      name: 'customize',
      incomplete: function () {
        return !exporter.customizations.brand || !exporter.customizations.title || !exporter.customizations.template ;
      }
    },
    filter: {
      name: 'filter',
      incomplete: function () {
        return !_.find(exporter.eventProperties, function (property) {
          return property.include === true;
        });
      }
    },
    confirm: {
      name: 'confirm'
    }
  };

  /**
   * This is a list of steps that the user has to navigate through.
   */
  exporter.steps = [
    exporter.exportSteps.format,
    exporter.exportSteps.confirm
  ];

  var activeStep = 0;
  exporter.nextStep = function () {
    if (exporter.isStepCompleted()) {
      setActiveStep(activeStep + 1);
    }
    else {
      exporter.hasErrors = true;
    }
  };

  exporter.previousStep = function () {
    setActiveStep(activeStep - 1);
  };

  exporter.isStepCompleted = function () {

    if (activeStep === -1) {
      return true;
    }

    var incompleteCheck = exporter.steps[activeStep].incomplete;
    return ((typeof incompleteCheck === 'undefined') || (typeof incompleteCheck === 'function' && !incompleteCheck()));
  };

  function setActiveStep(stepIndex) {
    if (stepIndex < 0) {
      activeStep = 0;
    } else if (stepIndex > exporter.steps.length) {
      activeStep = exporter.steps.length;
    } else {
      activeStep = stepIndex;
    }
  }

  exporter.isOnFirstStep = function () {
    return activeStep === 0;
  };

  exporter.getActiveStepName = function () {

    if (activeStep === -1) {
      return 'finished';
    }

    return exporter.steps[activeStep].name;
  };

  exporter.onLastStep = function () {
    return activeStep >= (exporter.steps.length - 1);
  };

  exporter.export = function () {

    var exportFormat = _.find(exporter.exportFormats, {type: exporter.format}),
        isCustomized = exportFormat && exportFormat.customizable === true,
        includedProperties,
        customizations;

    if (isCustomized) {
      customizations = exporter.customizations;
      customizations.logo = exporter.exportLogoUrl + customizations.brand.logo;
      customizations.brand = customizations.brand.name;
      customizations.template = customizations.template.name;
      includedProperties = [];
    } else {
      customizations = {};
      includedProperties = _.pluck(_.filter(exporter.eventProperties, 'include'), 'name');
    }

    eventExporter.export(exporter.format, exporter.email, includedProperties, exporter.dayByDay, customizations);
    activeStep = -1;
  };

  exporter.format = exporter.exportFormats[0].type;
  exporter.email = '';

  exporter.close = function () {
    $uibModalInstance.dismiss('cancel');
  };

  exporter.eventCount = eventExporter.activeExport.eventCount;
}
