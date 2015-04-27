import Ember from 'ember';
import CollectionWidget from 'ember-eureka/widget-collection';
import layout from '../templates/components/widget-collection-groupby';

export default CollectionWidget.extend({
    layout: layout,

    label: Ember.computed.alias('config.label'),
    property: Ember.computed.alias('config.property'),
    considerUnfilled: Ember.computed.alias('config.considerUnfilled'),
    chartType: Ember.computed.alias('config.chart.type'),
    chartTitle: Ember.computed.alias('config.chart.title'),
    chartSubtitle: Ember.computed.alias('config.chart.subtitle'),
    chartRepresentation: Ember.computed.bool('config.chart.type'),

    valueLegend: Ember.computed.alias('config.chart.valueLegend'),

    serieName: Ember.computed('config.chart.serieName', 'property', 'routeModel.meta', function() {
        var serieName = this.get('config.chart.serieName');
        if (!serieName) {
            var property = this.get('property');
            serieName = this.get('routeModel.meta.'+property+'Field.label');
        }
        return serieName;
    }),

    data: Ember.computed(function() {
        return Ember.A();
    }),

    /** hightchart configuration **/
    _chartMode: false,

    _chartCategories: function() {
        return this.get('data').mapBy('facet');
    }.property('data.@each.facet'),

    _chartOptions: function() {
        var chartType = this.get('chartType');
        var chartCategories = this.get('_chartCategories');
        var chartTitle = this.get('chartTitle') || '';
        var chartSubtitle = this.get('chartSubtitle') || '';

        var valueLegend = this.get('valueLegend') || 'number of matches';

        return {
            chart: {
                type: chartType
            },
            title: {
              text: chartTitle
            },
            subtitle: {
              text: chartSubtitle
            },
            xAxis: {
              categories: chartCategories
            },
            tooltip: {
                valueSuffix: ' matches'
            },
            legend: {
                labelFormatter: function() {
                    if (chartType === 'pie') {
                        return this.name + " (" + this.percentage.toFixed(1) + "%)";
                    }
                    return this.name;
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            yAxis: {
                title: {
                  text: valueLegend,
                  align: 'high'
                }
            }
        };
    }.property('chartType', '_chartCategories.[]', 'chartTitle', 'chartSubtitle', 'valueLegend'),

    _chartData: function() {
        var serieName = this.get('serieName');
        var data = this.get('data').map(function(item) {
            return {
                name: item.facet,
                y: item.count,
                selected: item.selected
            };
        });
        return [{
            name: serieName,
            data: data
        }];
    }.property('data.@each.count', 'serieName'),


    /** update the collection from the `routeModel.query` */
    fetch: function() {
        this.set('isLoading', true);
        var routeQuery = this.get('routeModel.query')._toObject();
        var property = this.get('property');
        var considerUnfilled = this.get('considerUnfilled');

        if (!property) {
            return;
        }

        if (this.get('routeModel.meta.'+property+'Field.isRelation')) {
            property = property+'.title';
        }

        var promises = Ember.A();
        promises.pushObject(this.get('store').groupBy(property, routeQuery));

        if (considerUnfilled) {
            let unfilledQuery = {};
            Ember.setProperties(unfilledQuery, routeQuery);
            unfilledQuery[property] = {'$exists': false};
            promises.pushObject(this.get('store').count(unfilledQuery));
        }

        var that = this;
        Ember.RSVP.all(promises).then(function(data) {
            var results = data[0];
            if (considerUnfilled) {
                results.push({facet: '_unfilled', count: data[1].total, selected: true});
            }

            that.set('data', results.toArray());
            that.set('isLoading', false);
        });
    }.observes(
        'routeModel.query.hasChanged',
        'routeModel.meta',
        'store',
        'property',
        'considerUnfilled'
    ).on('init')

});
