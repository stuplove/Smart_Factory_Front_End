'use strict';
var $ = window.jQuery = require('jquery');
// var moment = window.moment = require('moment');
var header = require('../includes/header');
var userId = require('../config/auth');
var config = require('../config/url');
var templates = require('../history/templates');
var factoryDropdown = require('../lib/component/dropdown-factory');
var filterDropdown = require('../history/components/dropdown-filter-type');
var valueDropdown = require('../history/components/dropdown-filter-value');

require('eonasdan-bootstrap-datetimepicker');


/* DOM */
var $tableListBlock = $('#history-table-block');
var $tableBody = $('#history-table-body');
var $imageBlock = $('#history-img-block');
var $searchBtn = $('#history-search-btn');
var $startDatePicker = $('#history-start-date-picker');
var $endDatePicker = $('#history-end-date-picker');

var focusFactoryId;
var selectedFilter;
var selectedValue;
var today = new Date();
var dateTimePickerOpt = {
		widgetPositioning: {
			horizontal: 'auto',
			vertical: 'bottom'
		},
		maxDate: today,
		ignoreReadonly: true
	};

initialize();

function initialize() {
	header.include();
	initializeDatetimePicker();
	bindEvents();
	searchHistoryThenRenderRows();
}

function initializeDatetimePicker() {
	$startDatePicker.datetimepicker(dateTimePickerOpt);
	$endDatePicker.datetimepicker(dateTimePickerOpt);

	setDefaultDate();
}

function setDefaultDate() {
	$startDatePicker.data("DateTimePicker").defaultDate(today);
	$endDatePicker.data("DateTimePicker").defaultDate(today);
}

function bindEvents() {
	bindDropdownsChangedEventListener();
	bindSearchListEventOnButton();
}

function bindDropdownsChangedEventListener() {
	factoryDropdown.emitter.on('factoryChanged', setFocusFactoryIdThenRenderRows);
	filterDropdown.emitter.on('filterChanged', switchDropdownAndDatepicker);
	valueDropdown.emitter.on('valueChanged', setSelectedValueThenRenderRows);
}

function bindSearchListEventOnButton() {
	$searchBtn.on('click', searchPeriodThenRenderRows);
}

function setFocusFactoryIdThenRenderRows(factoryId) {
	focusFactoryId = factoryId;

	searchHistoryThenRenderRows();
}

function switchDropdownAndDatepicker(filterId) {
	selectedFilter = filterId;

	if(selectedFilter === 'date_period'){
		valueDropdown.hide();
	}else {
		valueDropdown.showAndRenderDropdown(selectedFilter);
	}
}

function setSelectedValueThenRenderRows(valueId) {
	selectedValue = valueId;

	searchHistoryThenRenderRows();
}

function searchHistoryThenRenderRows() {

	if( !selectedFilter ) return;

	$.ajax({
		url: config.APIUrl + 'history/list/?factory_id=' + focusFactoryId + '&type=' + selectedFilter + '&search_key=' + selectedValue,
		beforeSend: function(){
			$imageBlock.empty();
			$tableBody.empty();
		}
	}).done(function(response){
	 	var infos = response || [];
		var type = selectedFilter.split('_')[0];

		createTableList(infos, type);
		displayImageBlock(infos, type);
	});
}

function searchPeriodThenRenderRows() {

}

function createTableList(infos, type) {
	var tableListRows = templates.renderTableList({ infos : infos });

	$tableBody.append( tableListRows );
 	$tableListBlock.find('.table-col').attr('class', 'table-col ' + type);
	$tableListBlock.find('.table-col-sm').attr('class', 'table-col-sm ' + type);
}

function displayImageBlock(infos, type) {
	switch (type){
		case "workorder":
			var chart = templates.renderChart();
			$imageBlock.append( chart ).removeClass('hidden');
		break;
		case "mold":
			var heatmap = templates.renderHeatmap({ info: infos[0] });
			$imageBlock.append( heatmap ).removeClass('hidden');
		break;
		default:
			$imageBlock.addClass('hidden');
		break;
	}
}