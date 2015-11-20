import Ember from 'ember';
import CollectionWidget from 'ember-eureka/widget-collection';
import layout from '../templates/components/widget-collection-groupby';

export default CollectionWidget.extend({
    layout: layout,

    label: Ember.computed.alias('config.label'),
    property: Ember.computed.alias('config.property'),

    target: Ember.computed('config.target', function() {
        return this.get('config.target') || this.get('property');
    }),

    operator: Ember.computed('config.operator', function() {
        return this.get('config.operator') || 'count';
    }),

    considerUnfilled: Ember.computed.alias('config.considerUnfilled'),
    chartType: Ember.computed.alias('config.chart.type'),
    chartTitle: Ember.computed.alias('config.chart.title'),
    chartSubtitle: Ember.computed.alias('config.chart.subtitle'),
    chartRepresentation: Ember.computed.bool('config.chart.type'),

    singleValueRepresentation: Ember.computed.alias('config.singleValue'),

    valueLegend: Ember.computed.alias('config.chart.valueLegend'),
    valueSuffix: Ember.computed.alias('config.chart.valueSuffix'),

    serieName: Ember.computed('config.chart.serieName', 'property', 'routeModel.meta', function() {
        var serieName = this.get('config.chart.serieName');
        if (!serieName) {
            var property = this.get('property');
            serieName = this.get(`routeModel.meta.${property}Field.label`);
        }
        return serieName;
    }),

    data: Ember.computed(function() {
        return Ember.A();
    }),

    /** hightchart configuration **/
    _chartMode: false,

    _chartCategories: Ember.computed('data.@each.label', function() {
        return this.get('data').mapBy('label');
    }),

    _chartOptions: Ember.computed(
      'chartType',
      '_chartCategories.[]',
      'chartTitle',
      'chartSubtitle',
      'valueLegend',
      'valueSuffix',
      'operator', function() {
        let chartType = this.get('chartType');
        let chartCategories = this.get('_chartCategories');
        let chartTitle = this.get('chartTitle') || '';
        let chartSubtitle = this.get('chartSubtitle') || '';

        let valueLegend = this.get('valueLegend') || 'number of matches';
        let valueSuffix = this.get('valueSuffix') || ' matches';
        let operator = this.get('operator');

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
                valueSuffix: valueSuffix
            },
            legend: {
                labelFormatter: function() {
                    if (chartType === 'pie') {
                        if (operator === 'count') {
                            return `${this.name} (${this.percentage.toFixed(1)}%)`;
                        } else {
                            return `${this.name} (${this.value}${valueSuffix})`;
                        }
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
    }),

    _chartData: Ember.computed('data.@each.value', 'serieName', function() {
        var serieName = this.get('serieName');
        var data = this.get('data').map(function(item) {
            return {
                name: item.label,
                y: item.value,
                selected: item.selected
            };
        });
        return [{
            name: serieName,
            data: data
        }];
    }),


    /** update the collection from the `routeModel.query` */
    fetch: Ember.on('init', Ember.observer(
      'routeModel.query.hasChanged',
      'routeModel.meta',
      'store',
      'property',
      'operator',
      'target',
      'singleValueRepresentation',
      'considerUnfilled', function() {

        this.set('isLoading', true);
        let routeQuery = this.get('routeModel.query')._toObject();

        let query = {};
        for (let fieldName of Object.keys(routeQuery)) {
            if (fieldName[0] === '_') {
                query[fieldName.slice(1)] = routeQuery[fieldName];
            } else {
                query.filter = query.filter || {};
                query.filter[fieldName] = routeQuery[fieldName];
            }
        }

        let property = this.get('property');

        if (!property) {
            return;
        }

        if (this.get(`routeModel.meta.${property}Field.isRelation`)) {
            property = `${property}.title`;
        }

        let operator = this.get('operator');
        let target = this.get('target');

        let aggregator = {
            property: property,
            operator: operator,
            target: target
        };

        let store = this.get('store');

        let promises = Ember.A();
        promises.pushObject(store.groupBy(aggregator, query));

        let considerUnfilled = this.get('considerUnfilled');
        if (considerUnfilled) {
            let unfilledQuery = {};
            Ember.setProperties(unfilledQuery, query);
            unfilledQuery[property] = {'$exists': false};
            promises.pushObject(store.count(unfilledQuery));
        }

        Ember.RSVP.all(promises).then((data) => {
            let results = data[0];
            if (this.get('singleValueRepresentation')) {
                if (results.length) {
                    this.set('data', results[0].value);
                }

            } else {

                if (considerUnfilled) {
                    results.push({label: '_unfilled', value: data[1], selected: true});
                }
                this.set('data', results.toArray());
            }
            this.set('isLoading', false);
        });
    }))

});
