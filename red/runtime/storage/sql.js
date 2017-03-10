/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var Sequelize = require('sequelize');
var when = require('when');
var fspath = require("path");

var settings, sequelize, Settings, LibraryEntrySettings;

var names = {
    flows: 0,
    credentials: 1,
    settings: 2,
    sessions: 3,
    library_entry: 4
};

var sql = {
    init: function(_settings) {
        settings = _settings;

        sequelize = new Sequelize(settings.sql.name, settings.sql.username, settings.sql.password, {
            host: settings.sql.host,
            dialect: 'mssql',
            dialectOptions: {
                encrypt: true
            }
        });

        Settings = sequelize.define('settings', {
            name: {
                type: Sequelize.INTEGER,
                validate: {
                    min: names.flows,
                    max: names.library_entry
                },
                allowNull: false
            },
            value: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        });

        LibraryEntrySettings = sequelize.define('libraryEntrySettings', {
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            path: {
                type: Sequelize.STRING,
                allowNull: false
            },
            meta: {
                type: Sequelize.STRING
            },
            body: {
                type: Sequelize.TEXT
            }
        });

        return when.promise(function(resolve, reject) {
            sequelize.authenticate()
                .then(function() {
                    return Settings.sync();
                })
                .then(function() {
                    return LibraryEntrySettings.sync();
                })
                .then(function() {
                    resolve();
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    },
    
    getFlows: function() {
        return sql.get(names.flows, []);
    },

    get: function(name, defaultValue) {
        return when.promise(function(resolve, reject) {
            sql.getSettingsGet(name)
                .then(function(data) {
                    resolve(data && data.dataValues ? JSON.parse(data.dataValues.value) : defaultValue);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    },

    getSettingsGet: function(name) {
        return Settings.findOne({
                    where: { name: name },
                    order: [
                        ['id', 'DESC']
                    ]
                });
    },

    getNames: function() {
        return names;
    },

    saveFlows: function(flows) {
        return sql.save(names.flows, flows);
    },

    save: function(name, value) {
        if (settings.readOnly) {
            return when.resolve();
        }

        var data = settings.flowFilePretty ?
            JSON.stringify(value, null, 4) :
            JSON.stringify(value);

        return when.promise(function(resolve, reject) {
            Settings.create({
                    name: name,
                    value: data
                })
                .then(function() {
                    resolve();
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    },

    getCredentials: function() {
        return sql.get(names.credentials, {});
    },

    saveCredentials: function(credentials) {
        return sql.save(names.credentials, credentials);
    },

    getSettings: function() {
        return sql.get(names.settings, {});
    },

    saveSettings: function(newSettings) {
        return sql.save(names.settings, newSettings);
    },

    getSessions: function() {
        return sql.get(names.sessions, {});
    },

    saveSessions: function(sessions) {
        return sql.save(names.sessions, sessions);
    },

    getLibraryEntry: function(type, path) {
        return when.promise(function(resolve, reject) {
            LibraryEntrySettings.findOne({
                where: {
                    type: type,
                    path: { $or: [path, path + '.json'] }
                },
                order: [
                    ['id', 'DESC']
                ]
            }).then(function(data) {
                if (data && data.dataValues && data.dataValues.body)
                    resolve(data.dataValues.body);
                else
                    return LibraryEntrySettings.findAll({
                        where: {
                            type: type,
                            path: { $like: path + '%' }
                        }
                    });
            }).then(function(data) {
                var result = sql.sortDocumentsIntoPaths(data);
                resolve(result[path] || []);
            }).catch(function(err) {
                reject(err);
            });
        });
    },

    sortDocumentsIntoPaths: function(documents) {
        var sorted = {};

        for (var i in documents) {
            var doc = documents[i];

            var p = fspath.dirname(doc.path);
            if (p === '.') {
                p = '';
            }

            if (!sorted[p]) {
                sorted[p] = [];
            }

            var obj
            if (doc.meta || doc.body) {
                obj = doc.meta ? JSON.parse(doc.meta) : {};
                obj.fn = fspath.basename(doc.path);
            } else {
                obj = fspath.basename(doc.path);
            }

            sorted[p].push(obj);
        }

        return sorted;
    },

    saveLibraryEntry: function(type, path, meta, body) {
        return when.promise(function(resolve, reject) {
            LibraryEntrySettings.create({
                    type: type,
                    path: path,
                    meta: meta ? JSON.stringify(meta) : null,
                    body: body
                })
                .then(function() {
                    resolve();
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }
};

module.exports = sql;