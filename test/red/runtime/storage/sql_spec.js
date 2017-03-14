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

var should = require("should");
var Sequelize = require('sequelize');

var sql = require("../../../../red/runtime/storage/sql");


describe('SQL', function() {

    var testFlow = [{ "type": "tab", "id": "d8be2a6d.2741d8", "label": "Sheet 1" }];
    var testCredentials = { "abc": { "type": "test credentials" } };
    var testSettings = { "def": { "type": "test settings" } };
    var testSessions = { "ghi": { "type": "test sessions" } };
    var realTestCredentials = { "$": "50e85dc1fc1db10ceb7f18f484b2572bNJA=" };

    var settings = {
        sql: {
            name: process.env.MSSQL_DATABASE,
            username: process.env.MSSQL_USER,
            password: process.env.MSSQL_PASSWORD,
            host: process.env.MSSQL_HOST
        }
    };

    var sequelize = new Sequelize(settings.sql.name, settings.sql.username, settings.sql.password, {
        host: settings.sql.host,
        dialect: 'mssql',
        dialectOptions: {
            encrypt: true
        }
    });
    sequelize.define('settings', {});
    sequelize.define('libraryEntrySettings', {});

    beforeEach(function(done) {
        sequelize.drop().then(function(err) {
            done();
        });
    });

    afterEach(function(done) {
        done();
    });

    it('should handle missing flows', function(done) {
        sql.init(settings).then(function() {
            sql.getFlows().then(function(flows) {
                flows.should.eql([]);
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should save flows', function(done) {
        sql.init(settings).then(function() {
            sql.saveFlows(testFlow).then(function() {
                sql.getFlows().then(function(flows) {
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should format the flows file when flowFilePretty specified', function(done) {
        sql.init(getFlowPrettySettings()).then(function() {
            sql.saveFlows(testFlow).then(function() {
                sql.getSettingsGet(sql.getNames().flows)
                    .then(function(flows) {
                        flows.dataValues.value.split("\n").length.should.be.above(1);
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    function getFlowPrettySettings() {
        var newSettings = Object.create(settings);
        newSettings.flowFilePretty = true;
        return newSettings;
    }

    it('should handle missing credentials', function(done) {
        sql.init(settings).then(function() {
            sql.getCredentials().then(function(creds) {
                creds.should.eql({});
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should handle credentials', function(done) {
        sql.init(settings).then(function() {
            sql.saveCredentials(testCredentials).then(function() {
                sql.getCredentials().then(function(creds) {
                    creds.should.eql(testCredentials);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should read latest credentials', function(done) {
        sql.init(settings).then(function() {
            sql.saveCredentials(testCredentials).then(function() {
                sql.saveCredentials(realTestCredentials).then(function() {
                    sql.getCredentials().then(function(creds) {
                        creds.should.eql(realTestCredentials);
                        done();
                    }).otherwise(function(err) {
                        done(err);
                    });
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should format the creds file when flowFilePretty specified', function(done) {
        sql.init(getFlowPrettySettings()).then(function() {
            sql.saveCredentials(testCredentials).then(function() {
                sql.getSettingsGet(sql.getNames().credentials)
                    .then(function(creds) {
                        creds.dataValues.value.split("\n").length.should.be.above(1);
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should handle non-existent settings', function(done) {
        sql.init(settings).then(function() {
            sql.getSettings().then(function(_settings) {
                _settings.should.eql({});
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });


    it('should handle settings', function(done) {
        sql.init(settings).then(function() {
            sql.saveSettings(testSettings).then(function() {
                sql.getSettings().then(function(_settings) {
                    _settings.should.eql(testSettings);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should handle non-existent sessions', function(done) {
        sql.init(settings).then(function() {
            sql.getSessions().then(function(sessions) {
                sessions.should.eql({});
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should handle sessions', function(done) {
        sql.init(settings).then(function() {
            sql.saveSessions(testSessions).then(function() {
                sql.getSessions().then(function(_sessions) {
                    _sessions.should.eql(testSessions);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return an empty list of library objects', function(done) {
        sql.init(settings).then(function() {
            sql.getLibraryEntry('object', '').then(function(flows) {
                flows.should.eql([]);
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return an empty list of library objects (path=/)', function(done) {
        sql.init(settings).then(function() {
            sql.getLibraryEntry('object', '/').then(function(flows) {
                flows.should.eql([]);
                done();
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return an error for a non-existent library object', function(done) {
        sql.init(settings).then(function() {
            sql.getLibraryEntry('object', 'A/B').then(function(flows) {
                should.fail(null, null, "non-existent flow");
            }).otherwise(function(err) {
                should.exist(err);
                done();
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    function createTestObjectLibrary(type) {
        type = type || "object";

        return sql.saveLibraryEntry(type, "A", null, null)
            .then(function(err) {
                return sql.saveLibraryEntry(type, "B", null, null);
            })
            .then(function(err) {
                return sql.saveLibraryEntry(type, "B/C", null, null);
            })
            .then(function(err) {
                return sql.saveLibraryEntry(type, "file1.js", { abc: "def" }, "// not a metaline \n\n Hi");
            })
            .then(function(err) {
                return sql.saveLibraryEntry(type, "B/file2.js", { ghi: "jkl" }, "// not a metaline \n\n Hi");
            })
            .then(function(err) {
                return sql.saveLibraryEntry(type, "B/flow.json", null, "Hi");
            });
    }

    it('should return a directory listing of library objects for path ""', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary().then(function(err) {
                sql.getLibraryEntry('object', '').then(function(flows) {
                    flows.should.eql(['A', 'B', { abc: 'def', fn: 'file1.js' }]);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return a directory listing of library objects for path B', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary().then(function(err) {
                sql.getLibraryEntry('object', 'B').then(function(flows) {
                    flows.should.eql(['C', { ghi: 'jkl', fn: 'file2.js' }, { fn: 'flow.json' }]);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return a directory listing of library objects for path B/C', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary().then(function(err) {
                sql.getLibraryEntry('object', 'B/C').then(function(flows) {
                    flows.should.eql([]);
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            }).otherwise(function(err) {
                done(err);
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should load a flow library object with .json unspecified', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary("flows").then(function(err) {
                sql.getLibraryEntry('flows', 'B/flow').then(function(flows) {
                    flows.should.eql("Hi");
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            });
        });

    });

    it('should return a library object', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary().then(function(err) {
                sql.getLibraryEntry('object', 'B/file2.js').then(function(body) {
                    body.should.eql("// not a metaline \n\n Hi");
                    done();
                }).otherwise(function(err) {
                    done(err);
                });
            });
        }).otherwise(function(err) {
            done(err);
        });
    });

    it('should return a newly saved library object', function(done) {
        sql.init(settings).then(function() {
            createTestObjectLibrary().then(function(err) {
                sql.getLibraryEntry('object', 'B').then(function(flows) {
                    flows.should.eql(['C', { ghi: 'jkl', fn: 'file2.js' }, { fn: 'flow.json' }]);
                    sql.saveLibraryEntry('object', 'B/D/file3.js', { mno: 'pqr' }, "// another non meta line\n\n Hi There").then(function() {
                        sql.getLibraryEntry('object', 'B/D').then(function(flows) {
                            flows.should.eql([{ mno: 'pqr', fn: 'file3.js' }]);
                            sql.getLibraryEntry('object', 'B/D/file3.js').then(function(body) {
                                body.should.eql("// another non meta line\n\n Hi There");
                                done();
                            }).otherwise(function(err) {
                                done(err);
                            });
                        }).otherwise(function(err) {
                            done(err);
                        });
                    }).otherwise(function(err) {
                        done(err);
                    });
                }).otherwise(function(err) {
                    done(err);
                });
            });
        }).otherwise(function(err) {
            done(err);
        });
    });
});