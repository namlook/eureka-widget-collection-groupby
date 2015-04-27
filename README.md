# Eureka-widget-collection-groupby

Group an Eureka collection by a property.

**Note**: this addon requires `ember-highcharts`

Usage:

    {
        type: 'collection-groupby',

        // group by this property
        property: <property>,

        // the label of the widget
        label: null,

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
