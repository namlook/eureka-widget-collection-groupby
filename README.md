# Eureka-widget-collection-groupby

Group an Eureka collection by a property.

**Note**: this addon requires `ember-highcharts`

Usage:

    {
        type: 'collection-groupby',

        // group by this property
        property: <property>,

        // aggregate with this operator
        // could be on of: 'avg', 'sum', 'max', 'min', 'count'
        operator: 'count',

        // the property to perform the aggregation
        // if not set, the target is the property
        target: null,

        // the label of the widget
        label: null,

        // if the aggregation produce only one value,
        // choose to emphasis this value
        singleValue: false

        // if `considerUnfilled` is true, then the number of item
        // which have their property unfilled will be displayed
        considerUnfilled: false,

        // if chart section exists, represent
        // the data as chart
        chart : {
            type: 'bar' // the chart to represent the data
                        // it can be 'bar', 'column', 'pie', 'line', 'area'
            title: ''   // the title of the chart (optional)
            subtitle: '' // the subtitle of the chart (optional)
            serieName: null, // the name of the serie (optional)
            valueLegend: 'number of matches', // what does represent the values ?
            valueSuffix: ' matches' // the value suffix to display
        }
    }

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
