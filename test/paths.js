'use strict';

require('mocha');
var path = require('path');
var Base = require('base');
var assert = require('assert');
var plugins = require('base-plugins');
var gm = require('global-modules');
var baseEnv = require('..');
var base;

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

describe('filepaths', function() {
  beforeEach(function() {
    Base.use(function fn() {
      this.isApp = true;
      return fn;
    });
    Base.use(plugins());
    Base.use(baseEnv());
    base = new Base();
  });

  describe('createEnv', function() {
    it('should create an env object from a filepath', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env);
    });

    it('should create an env object from a filepath when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert(env);
    });

    it('should support options as the last argument', function() {
      var env = base.createEnv('foo', 'index.js', {foo: 'bar'});
      assert(env);
      assert.equal(env.options.foo, 'bar');
    });

    it('should support options as the second argument', function() {
      var env = base.createEnv('foo', {foo: 'bar'}, 'index.js');
      assert(env);
      assert.equal(env.options.foo, 'bar');
    });
  });

  describe('env.inspect', function() {
    it('should expose an inspect method', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.inspect);
      assert.equal(typeof env.inspect, 'function');
    });

    it('should show [path] when env is created from a path', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert.equal(env.inspect(), '<Env "foo" [path ~/foo]>');
    });
  });

  describe('env.invoke', function() {
    it('should invoke a function with the given context', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'));
      var app = new Base();
      assert.deepEqual(env.invoke(app, app.base), env.app);
    });

    it('should return the cached instance when `invoke` is called', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'));
      var app = new Base();
      assert.deepEqual(env.invoke(app, app.base), env.app);
    });

    it('should wrap cached instances in a function', function() {
      var env = base.createEnv('readme', fixtures('generate-node'));
      var app = new Base();
      assert.deepEqual(env.invoke(app, app.base), env.app);
    });

    it('should not expose properties on instance until fn is invoked', function() {
      var env = base.createEnv('readme', fixtures('generate-node'));
      assert.strictEqual(typeof env.app.foo, 'undefined');
      env.invoke();
      assert.strictEqual(env.app.foo, 'bar');
    });
  });

  describe('env.stat', function() {
    it('should expose a stat object', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.stat);
      assert.equal(typeof env.stat, 'object');
    });
  });

  describe('env.base', function() {
    it('should expose env.base', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.base);
    });

    it('should set env.base', function() {
      var env = base.createEnv('foo', 'verb-readme-generator', {base: fixtures()});
      assert(env.base);
    });
  });

  describe('env.namespace', function() {
    it('should expose a namespace property', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.namespace);
      assert.equal(typeof env.namespace, 'string');
    });

    it('should set env.namespace with env.alias', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert.equal(env.namespace, 'base.foo');
    });

    it('should set a custom namespace', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      env.alias = 'bar';
      assert.equal(env.namespace, 'base.bar');
    });
  });

  describe('env.name', function() {
    it('should set the name on `env.name`', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'));
      assert.equal(env.name, 'readme');
    });

    it('should udpate env.name', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      env.name = 'foo';
      assert.equal(env.name, 'foo');
    });

    it('should set the name on `env.name` when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.equal(env.name, fixtures('verb-readme-generator'));
    });

    it('should get `name` from package.json if the file exists', function() {
      var env = base.createEnv(fixtures('generate-node'));
      assert.equal(env.name, 'foo-bar-baz');
    });
  });

  describe('env.isDefault', function() {
    it('should set isDefault to false when a name is passed', function() {
      var env = base.createEnv('foo', 'index.js');
      assert.equal(env.isDefault, false);
    });

    it('should not set name to default when an explicit name is passed', function() {
      var env = base.createEnv('foo', 'index.js');
      assert.equal(env.name, 'foo');
    });

    it('should set name to default when the name is default', function() {
      var env = base.createEnv('default', 'index.js');
      assert.equal(env.name, 'default');
    });

    it('should set name to default when the name is default outside working directory', function() {
      var env = base.createEnv('default', path.resolve(__dirname, 'fixtures/verb-readme-generator/index.js'));
      assert.equal(env.key, 'default');
      assert.equal(env.alias, 'default');
      assert.equal(env.name, 'default');
    });
  });

  describe('env.path', function() {
    it('should expose env.path', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.path);
    });

    it('should set the absolute path on `env.path`', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.path);
      assert.equal(typeof env.path, 'string');
      assert.equal(env.path, fixtures('verb-readme-generator/index.js'));
    });

    it('should update env.path', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      env.path = 'abc';
      assert.equal(env.path, 'abc');
    });

    it('should set the absolute path on `env.path` when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert(env.path);
      assert.equal(typeof env.path, 'string');
      assert.equal(env.path, fixtures('verb-readme-generator/index.js'));
    });

    it('should resolve a module from global npm modules', function() {
      var env = base.createEnv('npm:verb-readme-generator');
      assert(env.path);
      assert.equal(env.path, path.resolve(gm, 'verb-readme-generator/index.js'));
    });

    it('should throw when path does not exist', function(cb) {
      try {
        var env = base.createEnv('npm:dfosfjsslkslkfr');
        env && env.path;
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, `cannot resolve: 'npm:dfosfjsslkslkfr'`);
        cb();
      }
    });
  });

  describe('env.relative', function() {
    it('should expose env.relative', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.relative);
    });
  });

  describe('env.dirname', function() {
    it('should expose env.dirname', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.dirname);
      assert.equal(path.dirname(fixtures('verb-readme-generator/index.js')), env.dirname);
    });
  });

  describe('env.basename', function() {
    it('should set env.basename', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.basename);
    });

    it('should set the basename on `env.basename`', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert(env.basename);
      assert.equal(env.basename, 'index.js');
    });

    it('should set the basename on `env.basename` when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert(env.basename);
      assert.equal(env.basename, 'index.js');
    });
  });

  describe('env.stem', function() {
    it('should expose `env.stem`', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.equal(env.stem, 'index');
    });
  });

  describe('env.pkgPath', function() {
    it('should return null for `env.pkgPath` when `package.json` does not exist', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.strictEqual(env.pkgPath, null);
    });
  });

  describe('env.pkg', function() {
    it('should expose `env.pkg`', function() {
      var env = base.createEnv('index.js');
      assert.equal(env.pkg.name, 'base-env');
    });

    it('should return an empty object when package.json does not exist', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.deepEqual(env.pkg, {});
    });

    it('should resolve an actual file when package.json does not exist', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.deepEqual(env.path, path.join(fixtures('verb-readme-generator'), 'index.js'));
    });
  });

  describe('env.alias', function() {
    it('should set the alias on `env.alias`', function() {
      var env = base.createEnv('foo', fixtures('verb-readme-generator'));
      assert.equal(env.alias, 'foo');
    });

    it('should set the alias on `env.alias` when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'));
      assert.equal(env.alias, fixtures('verb-readme-generator'));
    });

    it('should support a custom alias function', function() {
      var env = base.createEnv('verb-readme-generator', fixtures('verb-readme-generator'), {
        toAlias: function(name) {
          return name.replace(/^verb-(.*?)-generator/, '$1');
        }
      });
      assert.equal(env.name, 'verb-readme-generator');
      assert.equal(env.alias, 'readme');
    });

    it.skip('should support a custom alias function when one arg is passed', function() {
      var env = base.createEnv(fixtures('verb-readme-generator'), {
        toAlias: function(name) {
          console.log(arguments)
          return name.replace(/^verb-(.*?)-generator/, '$1');
        }
      });
      assert.equal(env.name, 'verb-readme-generator');
      assert.equal(env.alias, 'readme');
    });
  });

  describe('env.fn', function() {
    it('should add a function from `env.path`', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'));
      assert(env.fn);
      assert.equal(typeof env.fn, 'function');
    });
  });

  describe('env.isMatch', function() {
    it.skip('should return true when val matches env.name', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'));
      assert(env.isMatch('readme'));
      assert(env.isMatch('verb-readme-generator'));
    });

    it('should return true when val matches env.alias', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'), {
        toAlias: function() {
          return 'foo';
        }
      });
      assert(env.isMatch('foo'));
    });

    it.skip('should return true when val matches package.json name', function() {
      var env = base.createEnv('readme', fixtures('verb-readme-generator'), {
        toAlias: function() {
          return 'foo';
        }
      });
      assert(env.isMatch('verb-readme-generator'));
    });

    it('should return false when val does not match', function() {
      var env = base.createEnv('foo-bar-baz', new Base(), {
        toAlias: function() {
          return 'foo';
        }
      });
      assert.equal(env.isMatch('bar'), false);
    });
  });
});
