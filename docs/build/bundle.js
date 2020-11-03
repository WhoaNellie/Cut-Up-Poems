
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /**
     * Emulates forthcoming HMR hooks in Svelte.
     *
     * All references to private component state ($$) are now isolated in this
     * module.
     */

    const captureState = cmp => {
      // sanity check: propper behaviour here is to crash noisily so that
      // user knows that they're looking at something broken
      if (!cmp) {
        throw new Error('Missing component')
      }
      if (!cmp.$$) {
        throw new Error('Invalid component')
      }
      const {
        $$: { callbacks, bound, ctx },
      } = cmp;
      const state = cmp.$capture_state();
      return { ctx, callbacks, bound, state }
    };

    // restoreState
    //
    // It is too late to restore context at this point because component instance
    // function has already been called (and so context has already been read).
    // Instead, we rely on setting current_component to the same value it has when
    // the component was first rendered -- which fix support for context, and is
    // also generally more respectful of normal operation.
    //
    const restoreState = (cmp, restore) => {
      if (!restore) {
        return
      }
      const { callbacks, bound } = restore;
      if (callbacks) {
        cmp.$$.callbacks = callbacks;
      }
      if (bound) {
        cmp.$$.bound = bound;
      }
      // props, props.$$slots are restored at component creation (works
      // better -- well, at all actually)
    };

    const pluck = source => (result, key) => {
      result[key] = source[key];
      return result
    };

    const extractProps = (state, { vars } = {}) => {
      if (!vars) {
        return state
      }
      return vars
        .filter(v => !!v.export_name)
        .map(v => v.export_name)
        .concat(
          Object.keys(state)
            .filter(name => name.substr(0, 2) === '$$')
            .map(v => v.name)
        )
        .reduce(pluck(state), {})
    };

    const get_current_component_safe = () => {
      // NOTE relying on dynamic bindings (current_component) makes us dependent on
      // bundler config (and apparently it does not work in demo-svelte-nollup)
      try {
        // unfortunately, unlike current_component, get_current_component() can
        // crash in the normal path (when there is really no parent)
        return get_current_component()
      } catch (err) {
        // ... so we need to consider that this error means that there is no parent
        //
        // that makes us tightly coupled to the error message but, at least, we
        // won't mute an unexpected error, which is quite a horrible thing to do
        if (err.message === 'Function called outside component initialization') {
          // who knows...
          return current_component
        } else {
          throw err
        }
      }
    };

    const createProxiedComponent = (
      Component,
      initialOptions,
      { onInstance, onMount, onDestroy }
    ) => {
      let cmp;
      let last;
      let compileData;
      let options = initialOptions;

      const isCurrent = _cmp => cmp === _cmp;

      const assignOptions = (target, anchor, restore, noPreserveState) => {
        const $$inject = noPreserveState
          ? extractProps(restore.state, compileData)
          : restore.state;
        const props = Object.assign({}, options.props);
        if ($$inject) {
          props.$$inject = $$inject;
        }
        options = Object.assign({}, initialOptions, { target, anchor, props });
      };

      const instrument = targetCmp => {
        const createComponent = (Component, restore, previousCmp) => {
          set_current_component(parentComponent || previousCmp);
          const comp = new Component(options);
          restoreState(comp, restore);
          instrument(comp);
          return comp
        };

        // `conservative: true` means we want to be sure that the new component has
        // actually been successfuly created before destroying the old instance.
        // This could be useful for preventing runtime errors in component init to
        // bring down the whole HMR. Unfortunately the implementation bellow is
        // broken (FIXME), but that remains an interesting target for when HMR hooks
        // will actually land in Svelte itself.
        //
        // The goal would be to render an error inplace in case of error, to avoid
        // losing the navigation stack (especially annoying in native, that is not
        // based on URL navigation, so we lose the current page on each error).
        //
        targetCmp.$replace = (
          Component,
          {
            target = options.target,
            anchor = options.anchor,
            noPreserveState,
            conservative = false,
          }
        ) => {
          compileData = Component.$compile;
          const restore = captureState(targetCmp);
          assignOptions(target, anchor, restore, noPreserveState);
          const previous = cmp;
          if (conservative) {
            try {
              const next = createComponent(Component, restore, previous);
              // prevents on_destroy from firing on non-final cmp instance
              cmp = null;
              previous.$destroy();
              cmp = next;
            } catch (err) {
              cmp = previous;
              throw err
            }
          } else {
            // prevents on_destroy from firing on non-final cmp instance
            cmp = null;
            if (previous) {
              // previous can be null if last constructor has crashed
              previous.$destroy();
            }
            cmp = createComponent(Component, restore, last);
            last = cmp;
          }
          return cmp
        };

        // NOTE onMount must provide target & anchor (for us to be able to determinate
        // 			actual DOM insertion point)
        //
        // 			And also, to support keyed list, it needs to be called each time the
        // 			component is moved (same as $$.fragment.m)
        if (onMount) {
          const m = targetCmp.$$.fragment.m;
          targetCmp.$$.fragment.m = (...args) => {
            const result = m(...args);
            onMount(...args);
            return result
          };
        }

        // NOTE onDestroy must be called even if the call doesn't pass through the
        //      component's $destroy method (that we can hook onto by ourselves, since
        //      it's public API) -- this happens a lot in svelte's internals, that
        //      manipulates cmp.$$.fragment directly, often binding to fragment.d,
        //      for example
        if (onDestroy) {
          targetCmp.$$.on_destroy.push(() => {
            if (isCurrent(targetCmp)) {
              onDestroy();
            }
          });
        }

        if (onInstance) {
          onInstance(targetCmp);
        }

        // Svelte 3 creates and mount components from their constructor if
        // options.target is present.
        //
        // This means that at this point, the component's `fragment.c` and,
        // most notably, `fragment.m` will already have been called _from inside
        // createComponent_. That is: before we have a chance to hook on it.
        //
        // Proxy's constructor
        //   -> createComponent
        //     -> component constructor
        //       -> component.$$.fragment.c(...) (or l, if hydrate:true)
        //       -> component.$$.fragment.m(...)
        //
        //   -> you are here <-
        //
        if (onMount) {
          const { target, anchor } = options;
          if (target) {
            onMount(target, anchor);
          }
        }
      };

      const parentComponent = get_current_component_safe();

      cmp = new Component(options);

      instrument(cmp);

      return cmp
    };

    /**
     * The HMR proxy is a component-like object whose task is to sit in the
     * component tree in place of the proxied component, and rerender each
     * successive versions of said component.
     */

    const handledMethods = ['constructor', '$destroy'];
    const forwardedMethods = ['$set', '$on'];

    const logError = (msg, err) => {
      // eslint-disable-next-line no-console
      console.error('[HMR][Svelte]', msg);
      if (err) {
        // NOTE avoid too much wrapping around user errors
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    const posixify = file => file.replace(/[/\\]/g, '/');

    const getBaseName = id =>
      id
        .split('/')
        .pop()
        .split('.')
        .slice(0, -1)
        .join('.');

    const capitalize = str => str[0].toUpperCase() + str.slice(1);

    const getFriendlyName = id => capitalize(getBaseName(posixify(id)));

    const getDebugName = id => `<${getFriendlyName(id)}>`;

    const relayCalls = (getTarget, names, dest = {}) => {
      for (const key of names) {
        dest[key] = function(...args) {
          const target = getTarget();
          if (!target) {
            return
          }
          return target[key] && target[key].call(this, ...args)
        };
      }
      return dest
    };

    const copyComponentProperties = (proxy, cmp, previous) => {
      //proxy custom methods
      const props = Object.getOwnPropertyNames(Object.getPrototypeOf(cmp));
      if (previous) {
        previous.forEach(prop => {
          delete proxy[prop];
        });
      }
      return props.filter(prop => {
        if (!handledMethods.includes(prop) && !forwardedMethods.includes(prop)) {
          Object.defineProperty(proxy, prop, {
            configurable: true,
            get() {
              return cmp[prop]
            },
            set(value) {
              // we're changing it on the real component first to see what it
              // gives... if it throws an error, we want to throw the same error in
              // order to most closely follow non-hmr behaviour.
              cmp[prop] = value;
              // who knows? maybe the value has been transformed somehow
              proxy[prop] = cmp[prop];
            },
          });
          return true
        }
      })
    };

    // everything in the constructor!
    //
    // so we don't polute the component class with new members
    //
    // specificity & conformance with Svelte component constructor is achieved
    // in the "component level" (as opposed "instance level") createRecord
    //
    class ProxyComponent {
      constructor(
        {
          Adapter,
          id,
          debugName,
          current, // { Component, hotOptions: { noPreserveState, ... } }
          register,
        },
        options // { target, anchor, ... }
      ) {
        let cmp;
        let disposed = false;
        let lastError = null;

        const destroyComponent = () => {
          // destroyComponent is tolerant (don't crash on no cmp) because it
          // is possible that reload/rerender is called after a previous
          // createComponent has failed (hence we have a proxy, but no cmp)
          if (cmp) {
            cmp.$destroy();
            cmp = null;
          }
        };

        const refreshComponent = (target, anchor, conservativeDestroy) => {
          if (lastError) {
            lastError = null;
            adapter.rerender();
          } else {
            try {
              const noPreserveState = current.hotOptions.noPreserveState;
              const replaceOptions = { target, anchor, noPreserveState };
              if (conservativeDestroy) {
                replaceOptions.conservativeDestroy = true;
              }
              cmp = cmp.$replace(current.Component, replaceOptions);
            } catch (err) {
              setError(err);
              if (
                !current.hotOptions.optimistic ||
                // non acceptable components (that is components that have to defer
                // to their parent for rerender -- e.g. accessors, named exports)
                // are most tricky, and they havent been considered when most of the
                // code has been written... as a result, they are especially tricky
                // to deal with, it's better to consider any error with them to be
                // fatal to avoid odities
                !current.canAccept ||
                (err && err.hmrFatal)
              ) {
                throw err
              } else {
                // const errString = String((err && err.stack) || err)
                logError(`Error during component init: ${debugName}`, err);
              }
            }
          }
        };

        const setError = err => {
          lastError = err;
          adapter.renderError(err);
        };

        const instance = {
          hotOptions: current.hotOptions,
          proxy: this,
          id,
          debugName,
          refreshComponent,
        };

        const adapter = new Adapter(instance);

        const { afterMount, rerender } = adapter;

        // $destroy is not called when a child component is disposed, so we
        // need to hook from fragment.
        const onDestroy = () => {
          // NOTE do NOT call $destroy on the cmp from here; the cmp is already
          //   dead, this would not work
          if (!disposed) {
            disposed = true;
            adapter.dispose();
            unregister();
          }
        };

        // ---- register proxy instance ----

        const unregister = register(rerender);

        // ---- augmented methods ----

        this.$destroy = () => {
          destroyComponent();
          onDestroy();
        };

        // ---- forwarded methods ----

        const getComponent = () => cmp;

        relayCalls(getComponent, forwardedMethods, this);

        // ---- create & mount target component instance ---

        try {
          let lastProperties;
          cmp = createProxiedComponent(current.Component, options, {
            onDestroy,
            onMount: afterMount,
            onInstance: comp => {
              // WARNING the proxy MUST use the same $$ object as its component
              // instance, because a lot of wiring happens during component
              // initialisation... lots of references to $$ and $$.fragment have
              // already been distributed around when the component constructor
              // returns, before we have a chance to wrap them (and so we can't
              // wrap them no more, because existing references would become
              // invalid)
              this.$$ = comp.$$;
              lastProperties = copyComponentProperties(this, comp, lastProperties);
            },
          });
        } catch (err) {
          setError(err);
          throw err
        }
      }
    }

    const copyStatics = (component, proxy) => {
      //forward static properties and methods
      for (const key in component) {
        proxy[key] = component[key];
      }
    };

    let fatalError = false;

    const hasFatalError = () => fatalError;

    /**
     * Creates a HMR proxy and its associated `reload` function that pushes a new
     * version to all existing instances of the component.
     */
    function createProxy(Adapter, id, Component, hotOptions, canAccept) {
      const debugName = getDebugName(id);
      const instances = [];

      // current object will be updated, proxy instances will keep a ref
      const current = {
        Component,
        hotOptions,
        canAccept,
      };

      const name = `Proxy${debugName}`;

      // this trick gives the dynamic name Proxy<Component> to the concrete
      // proxy class... unfortunately, this doesn't shows in dev tools, but
      // it stills allow to inspect cmp.constructor.name to confirm an instance
      // is a proxy
      const proxy = {
        [name]: class extends ProxyComponent {
          constructor(options) {
            try {
              super(
                {
                  Adapter,
                  id,
                  debugName,
                  current,
                  register: rerender => {
                    instances.push(rerender);
                    const unregister = () => {
                      const i = instances.indexOf(rerender);
                      instances.splice(i, 1);
                    };
                    return unregister
                  },
                },
                options
              );
            } catch (err) {
              // If we fail to create a proxy instance, any instance, that means
              // that we won't be able to fix this instance when it is updated.
              // Recovering to normal state will be impossible. HMR's dead.
              //
              // Fatal error will trigger a full reload on next update (reloading
              // right now is kinda pointless since buggy code still exists).
              //
              // NOTE Only report first error to avoid too much polution -- following
              // errors are probably caused by the first one, or they will show up
              // in turn when the first one is fixed ¯\_(ツ)_/¯
              //
              if (!fatalError) {
                fatalError = true;
                logError(
                  `Unrecoverable error in ${debugName}: next update will trigger a ` +
                    `full reload`
                );
              }
              throw err
            }
          }
        },
      }[name];

      // initialize static members
      copyStatics(current.Component, proxy);

      const update = newState => Object.assign(current, newState);

      // reload all existing instances of this component
      const reload = () => {
        // update current references
        // Object.assign(current, { Component, hotOptions })
        // const { Component, hotOptions } = current

        // copy statics before doing anything because a static prop/method
        // could be used somewhere in the create/render call
        // TODO delete props/methods previously added and of which value has
        // not changed since
        copyStatics(current.Component, proxy);

        const errors = [];

        instances.forEach(rerender => {
          try {
            rerender();
          } catch (err) {
            logError(`Failed to rerender ${debugName}`, err);
            errors.push(err);
          }
        });

        if (errors.length > 0) {
          return false
        }

        return true
      };

      const hasFatalError = () => fatalError;

      return { id, proxy, update, reload, hasFatalError, current }
    }

    /* eslint-env browser */

    const logPrefix = '[HMR:Svelte]';

    // eslint-disable-next-line no-console
    const log = (...args) => console.log(logPrefix, ...args);

    const domReload = () => {
      // eslint-disable-next-line no-undef
      const win = typeof window !== 'undefined' && window;
      if (win && win.location && win.location.reload) {
        log('Reload');
        win.location.reload();
      } else {
        log('Full reload required');
      }
    };

    const replaceCss = (previousId, newId) => {
      if (typeof document === 'undefined') return false
      if (!previousId) return false
      if (!newId) return false
      // svelte-xxx-style => svelte-xxx
      const previousClass = previousId.slice(0, -6);
      const newClass = newId.slice(0, -6);
      // eslint-disable-next-line no-undef
      document.querySelectorAll('.' + previousClass).forEach(el => {
        el.classList.remove(previousClass);
        el.classList.add(newClass);
      });
      return true
    };

    const removeStylesheet = cssId => {
      if (cssId == null) return
      if (typeof document === 'undefined') return
      // eslint-disable-next-line no-undef
      const el = document.getElementById(cssId);
      if (el) el.remove();
      return
    };

    const defaultArgs = {
      reload: domReload,
    };

    const makeApplyHmr = transformArgs => args => {
      const allArgs = transformArgs({ ...defaultArgs, ...args });
      return applyHmr(allArgs)
    };

    const isNamedExport = v => v.export_name && v.module;

    let needsReload = false;

    function applyHmr(args) {
      const {
        id,
        cssId,
        nonCssHash,
        reload = domReload,
        // normalized hot API (must conform to rollup-plugin-hot)
        hot,
        hotOptions,
        Component,
        compileData,
        compileOptions,
        ProxyAdapter,
      } = args;

      const existing = hot.data && hot.data.record;

      let canAccept = !existing || existing.current.canAccept;

      // meta info from compilation (vars, things that could be inspected in AST...)
      // can be used to help the proxy better emulate the proxied component (and
      // better mock svelte hooks, in the wait for official support)
      if (compileData) {
        // NOTE we're making Component carry the load to minimize diff with base branch
        Component.$compile = compileData;

        // if the module has named exports (in context="module"), then we can't
        // auto accept the component, since all the consumers need to be aware of
        // the change (e.g. rerender with the new exports value)
        if (!hotOptions.acceptNamedExports && canAccept) {
          const hasNamedExports = compileData.vars.some(isNamedExport);
          if (hasNamedExports) {
            canAccept = false;
          }
        }

        // ...same for accessors: if accessible props change, then we need to
        // rerender/rerun all the consumers to reflect the change
        if (
          !hotOptions.acceptAccessors &&
          (compileData.accessors || (compileOptions && compileOptions.accessors))
        ) {
          canAccept = false;
        }
      }

      const r =
        existing || createProxy(ProxyAdapter, id, Component, hotOptions, canAccept);

      const cssOnly =
        hotOptions.injectCss &&
        existing &&
        nonCssHash &&
        existing.current.nonCssHash === nonCssHash;

      r.update({ Component, hotOptions, canAccept, cssId, nonCssHash, cssOnly });

      hot.dispose(data => {
        // handle previous fatal errors
        if (needsReload || hasFatalError()) {
          if (hotOptions && hotOptions.noReload) {
            log('Full reload required');
          } else {
            reload();
          }
        }

        data.record = r;

        if (r.current.cssId !== cssId) {
          if (hotOptions.cssEjectDelay) {
            setTimeout(() => removeStylesheet(cssId), hotOptions.cssEjectDelay);
          } else {
            removeStylesheet(cssId);
          }
        }
      });

      if (canAccept) {
        hot.accept(async ({ bubbled } = {}) => {
          const newCssId = r.current.cssId;
          const cssChanged = newCssId !== cssId;
          // ensure old style sheet has been removed by now
          if (cssChanged) removeStylesheet(cssId);
          // guard: css only change
          if (
            // NOTE bubbled is provided only by rollup-plugin-hot, and we
            // can't safely assume a CSS only change without it... this means we
            // can't support CSS only injection with Nollup or Webpack currently
            bubbled === false && // WARNING check false, not falsy!
            r.current.cssOnly &&
            (!cssChanged || replaceCss(cssId, newCssId))
          ) {
            return
          }

          const success = await r.reload();

          if (hasFatalError() || (!success && !hotOptions.optimistic)) {
            needsReload = true;
          }
        });
      }

      // well, endgame... we won't be able to render next updates, even successful,
      // if we don't have proxies in svelte's tree
      //
      // since we won't return the proxy and the app will expect a svelte component,
      // it's gonna crash... so it's best to report the real cause
      //
      // full reload required
      //
      const proxyOk = r && r.proxy;
      if (!proxyOk) {
        throw new Error(`Failed to create HMR proxy for Svelte component ${id}`)
      }

      return r.proxy
    }

    const applyHmr$1 = makeApplyHmr(args =>
    	Object.assign({}, args, {
    		hot: args.m.hot,
    	})
    );

    const removeElement = el => el && el.parentNode && el.parentNode.removeChild(el);

    const ErrorOverlay = () => {
      let errors = [];
      let compileError = null;

      const errorsTitle = 'Failed to init component';
      const compileErrorTitle = 'Failed to compile';

      const style = {
        section: `
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 32px;
      background: rgba(0, 0, 0, .85);
      font-family: Menlo, Consolas, monospace;
      font-size: large;
      color: rgb(232, 232, 232);
      overflow: auto;
      z-index: 2147483647;
    `,
        h1: `
      margin-top: 0;
      color: #E36049;
      font-size: large;
      font-weight: normal;
    `,
        h2: `
      margin: 32px 0 0;
      font-size: large;
      font-weight: normal;
    `,
        pre: ``,
      };

      const createOverlay = () => {
        const h1 = document.createElement('h1');
        h1.style = style.h1;
        const section = document.createElement('section');
        section.appendChild(h1);
        section.style = style.section;
        const body = document.createElement('div');
        section.appendChild(body);
        return { h1, el: section, body }
      };

      const setTitle = title => {
        overlay.h1.textContent = title;
      };

      const show = () => {
        const { el } = overlay;
        if (!el.parentNode) {
          const target = document.body;
          target.appendChild(overlay.el);
        }
      };

      const hide = () => {
        const { el } = overlay;
        if (el.parentNode) {
          overlay.el.remove();
        }
      };

      const update = () => {
        if (compileError) {
          overlay.body.innerHTML = '';
          setTitle(compileErrorTitle);
          const errorEl = renderError(compileError);
          overlay.body.appendChild(errorEl);
          show();
        } else if (errors.length > 0) {
          overlay.body.innerHTML = '';
          setTitle(errorsTitle);
          errors.forEach(({ title, message }) => {
            const errorEl = renderError(message, title);
            overlay.body.appendChild(errorEl);
          });
          show();
        } else {
          hide();
        }
      };

      const renderError = (message, title) => {
        const div = document.createElement('div');
        if (title) {
          const h2 = document.createElement('h2');
          h2.textContent = title;
          h2.style = style.h2;
          div.appendChild(h2);
        }
        const pre = document.createElement('pre');
        pre.textContent = message;
        div.appendChild(pre);
        return div
      };

      const addError = (error, title) => {
        const message = (error && error.stack) || error;
        errors.push({ title, message });
        update();
      };

      const clearErrors = () => {
        errors.forEach(({ element }) => {
          removeElement(element);
        });
        errors = [];
        update();
      };

      const setCompileError = message => {
        compileError = message;
        update();
      };

      const overlay = createOverlay();

      return {
        addError,
        clearErrors,
        setCompileError,
      }
    };

    /* global window, document */

    const removeElement$1 = el => el && el.parentNode && el.parentNode.removeChild(el);

    class ProxyAdapterDom {
      constructor(instance) {
        this.instance = instance;
        this.insertionPoint = null;

        this.afterMount = this.afterMount.bind(this);
        this.rerender = this.rerender.bind(this);
      }

      // NOTE overlay is only created before being actually shown to help test
      // runner (it won't have to account for error overlay when running assertions
      // about the contents of the rendered page)
      static getErrorOverlay(noCreate = false) {
        if (!noCreate && !this.errorOverlay) {
          this.errorOverlay = ErrorOverlay();
        }
        return this.errorOverlay
      }

      static renderCompileError(message) {
        const noCreate = !message;
        const overlay = this.getErrorOverlay(noCreate);
        if (!overlay) return
        overlay.setCompileError(message);
      }

      dispose() {
        // Component is being destroyed, detaching is not optional in Svelte3's
        // component API, so we can dispose of the insertion point in every case.
        if (this.insertionPoint) {
          removeElement$1(this.insertionPoint);
          this.insertionPoint = null;
        }
        this.clearError();
      }

      // NOTE afterMount CAN be called multiple times (e.g. keyed list)
      afterMount(target, anchor) {
        const {
          instance: { debugName },
        } = this;
        if (!this.insertionPoint) {
          this.insertionPoint = document.createComment(debugName);
        }
        target.insertBefore(this.insertionPoint, anchor);
      }

      rerender() {
        this.clearError();
        const {
          instance: { refreshComponent },
          insertionPoint,
        } = this;
        if (!insertionPoint) {
          throw new Error('Cannot rerender: missing insertion point')
        }
        refreshComponent(insertionPoint.parentNode, insertionPoint);
      }

      renderError(err) {
        const {
          instance: { debugName },
        } = this;
        const title = debugName || err.moduleName || 'Error';
        this.constructor.getErrorOverlay().addError(err, title);
      }

      clearError() {
        const overlay = this.constructor.getErrorOverlay(true);
        if (!overlay) return
        overlay.clearErrors();
      }
    }

    if (typeof window !== 'undefined') {
      window.__SVELTE_HMR_ADAPTER = ProxyAdapterDom;
    }

    /* src\Words.svelte generated by Svelte v3.23.0 */
    const file = "src\\Words.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (124:0) {#each words as word, i}
    function create_each_block(ctx) {
    	let svg;
    	let path;
    	let path_fill_value;
    	let clipPath;
    	let clipPath_id_value;
    	let text_1;
    	let t_value = /*word*/ ctx[8] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_style_value;
    	let text_1_clip_path_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			clipPath = svg_element("clipPath");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(path, "fill", path_fill_value = "hsl(44, 100%, " + (97 + Math.floor(Math.random() * 4)) + "%)");
    			attr_dev(path, "class", "svelte-jhpy9z");
    			add_location(path, file, 131, 4, 5116);
    			attr_dev(clipPath, "id", clipPath_id_value = `paper${/*i*/ ctx[10]}`);
    			add_location(clipPath, file, 136, 4, 5215);
    			attr_dev(text_1, "x", text_1_x_value = (5 + Math.random() * 20).toFixed(2));
    			attr_dev(text_1, "y", text_1_y_value = (35 + Math.random() * 20).toFixed(2));
    			attr_dev(text_1, "style", text_1_style_value = generateTextStyle());
    			attr_dev(text_1, "clip-path", text_1_clip_path_value = `url(#paper${/*i*/ ctx[10]})`);
    			attr_dev(text_1, "class", "svelte-jhpy9z");
    			add_location(text_1, file, 139, 4, 5271);
    			attr_dev(svg, "class", "svelte-jhpy9z");
    			add_location(svg, file, 124, 0, 4972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(svg, clipPath);
    			append_dev(svg, text_1);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "mousedown", /*handleDrag*/ ctx[1], false, false, false),
    					listen_dev(svg, "mouseup", /*handleRelease*/ ctx[2], false, false, false),
    					listen_dev(svg, "touchstart", /*handleDrag*/ ctx[1], false, false, false),
    					listen_dev(svg, "touchend", /*handleRelease*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*words*/ 1 && t_value !== (t_value = /*word*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(124:0) {#each words as word, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let each_1_anchor;
    	let each_value = /*words*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleDrag, handleRelease, Math, generateTextStyle, words*/ 7) {
    				each_value = /*words*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function generateTextStyle() {
    	let size = (1.7 + Math.random() * 1.2).toFixed(2) + "rem";

    	let colors = [
    		"#333",
    		"#271d1d",
    		"#1d1d27",
    		"#464646",
    		"#0e0e0a",
    		"#8a1503",
    		"#2a3980",
    		"#282894"
    	];

    	let fonts = [
    		"serif",
    		"sans-serif",
    		"helvetica",
    		"arial",
    		"Times New Roman",
    		"Georgia",
    		"Book Antiqua",
    		"Impact",
    		"Lucida Sans Unicode",
    		"Courier New",
    		"Lucida Console",
    		"Trebuchet MS"
    	];

    	return `font-size: ${size};
                fill: ${colors[Math.floor(Math.random() * colors.length)]};
                font-family: ${fonts[Math.floor(Math.random() * fonts.length)]};`;
    }

    function generateWords() {
    	let svgs = Array.from(document.getElementsByTagName("svg"));

    	for (let i = 0; i < svgs.length; i++) {
    		let text = svgs[i].lastChild;
    		let height = text.getBBox().height;
    		let width = text.getBBox().width;
    		let calcHeight = height + text.getBBox().y + Math.random() * 3;
    		let calcWidth = width + text.getBBox().x + Math.random() * 15;
    		svgs[i].setAttribute("height", calcHeight.toFixed(2));
    		svgs[i].setAttribute("width", calcWidth.toFixed(2));
    		let x = Math.random() * 3;
    		let y = Math.random() * 8;
    		let x1 = Math.random() * 20;
    		let y1 = y - Math.random() * y;
    		let x2 = Math.random() * (calcWidth - x1);
    		let y2 = y - Math.random() * y;

    		let cutTop = `M ${x} ${y} 
             C ${x1.toFixed(2)} ${y1.toFixed(2)}, 
               ${x2.toFixed(2)} ${y2.toFixed(2)}, 
               ${calcWidth.toFixed(2)} 0 
             L ${calcWidth.toFixed(2)} ${calcHeight.toFixed(2)} 
             L 0 ${calcHeight.toFixed(2)}  
             Z`;

    		let cutBottom = `M ${x} ${y} 
             L ${calcWidth.toFixed(2)} 0
             L ${calcWidth.toFixed(2)} ${calcHeight.toFixed(2)} 
             C ${(calcWidth - x2).toFixed(2)} ${(calcHeight - y2).toFixed(2)}, 
               ${(calcWidth - x1).toFixed(2)} ${(calcHeight - y1).toFixed(2)}, 
               0 ${calcHeight.toFixed(2)} 
             Z`;

    		svgs[i].firstChild.setAttribute("d", [cutTop, cutBottom][Math.floor(Math.random() * 2)]);

    		//adding a clip path that hopefully cuts off text that flows outside of the paper, hard to test though
    		let paper = svgs[i].firstChild;

    		let paperPath = paper.cloneNode(true);
    		svgs[i].querySelector(":nth-child(2)").append(paperPath);

    		//place randomly on page
    		svgs[i].style.top = `${Math.random() * window.innerHeight - 10}px`;

    		svgs[i].style.left = `${Math.random() * window.innerWidth - 20}px`;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { words } = $$props;
    	let clientY = 0;
    	let clientX = 0;
    	let mouseListener;
    	let touchListener;
    	let top = words.length + 1;

    	function handleDrag(e) {
    		if (e.type === "mousedown") {
    			mouseListener = function (mouseEvent) {
    				clientY = mouseEvent.clientY;
    				clientX = mouseEvent.clientX;
    				e.target.style.top = clientY - e.target.height.baseVal.value / 2 + "px";
    				e.target.style.left = clientX - e.target.width.baseVal.value / 2 + "px";
    				e.target.style.filter = "drop-shadow(2px 2px 2px #2b2b2173)";
    			};

    			document.addEventListener("mousemove", mouseListener);
    			e.target.style.zIndex = top;
    			top++;
    		} else if (e.type === "touchstart") {
    			touchListener = function (touchEvent) {
    				clientY = touchEvent.changedTouches[0].pageY;
    				clientX = touchEvent.changedTouches[0].pageX;
    				e.target.style.top = clientY - e.target.height.baseVal.value / 2 + "px";
    				e.target.style.left = clientX - e.target.width.baseVal.value / 2 + "px";
    				e.target.style.filter = "drop-shadow(2px 2px 2px #2b2b2173)";
    			};

    			document.addEventListener("touchmove", touchListener);
    			e.target.style.zIndex = top;
    			top++;
    		}
    	}

    	function handleRelease(e) {
    		e.target.style.filter = "drop-shadow(1px 1px 1px #2b2b2149)";
    		document.removeEventListener("mousemove", mouseListener);
    		document.removeEventListener("touchmove", touchListener);
    	}

    	onMount(() => {
    		generateWords();
    	});

    	afterUpdate(function () {
    		generateWords();
    	}); // let svgs = Array.from(document.getElementsByTagName("svg"));
    	// for(let i = 0; i < svgs.length; i++){
    	//     fly(svgs[i], { x: 100, y: 200, duration: 2000, opacity: 1 });
    	// }

    	const writable_props = ["words"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Words> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Words", $$slots, []);

    	$$self.$set = $$props => {
    		if ("words" in $$props) $$invalidate(0, words = $$props.words);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		fly,
    		words,
    		clientY,
    		clientX,
    		mouseListener,
    		touchListener,
    		top,
    		handleDrag,
    		handleRelease,
    		generateTextStyle,
    		generateWords
    	});

    	$$self.$inject_state = $$props => {
    		if ("words" in $$props) $$invalidate(0, words = $$props.words);
    		if ("clientY" in $$props) clientY = $$props.clientY;
    		if ("clientX" in $$props) clientX = $$props.clientX;
    		if ("mouseListener" in $$props) mouseListener = $$props.mouseListener;
    		if ("touchListener" in $$props) touchListener = $$props.touchListener;
    		if ("top" in $$props) top = $$props.top;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [words, handleDrag, handleRelease];
    }

    class Words extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { words: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Words",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*words*/ ctx[0] === undefined && !("words" in props)) {
    			console.warn("<Words> was created without expected prop 'words'");
    		}
    	}

    	get words() {
    		throw new Error("<Words>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set words(value) {
    		throw new Error("<Words>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    var Words$1 = Words
      = ({ url: (document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href) }) && undefined
        ? applyHmr$1({
            m: ({ url: (document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href) }),
            id: "C:\\Users\\fabyb\\OneDrive\\Desktop\\Projects\\Cut-Up-Poems\\src\\Words.svelte",
            hotOptions: {"noPreserveState":false,"noPreserveStateKey":"@!hmr","noReload":false,"optimistic":false,"acceptNamedExports":false,"acceptAccessors":false,"injectCss":true,"cssEjectDelay":100,"hot":true,"noDisableCss":true,"nollup":false},
            Component: Words,
            ProxyAdapter: ProxyAdapterDom,
            compileData: {"vars":[{"name":"onMount","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"afterUpdate","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"fly","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"words","export_name":"words","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"clientY","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"clientX","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"mouseListener","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"touchListener","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"top","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"handleDrag","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"handleRelease","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"generateTextStyle","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"generateWords","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true}],"accessors":false},
            compileOptions: {"dev":true,"css":false,"format":"esm","sveltePath":"svelte","filename":"C:\\Users\\fabyb\\OneDrive\\Desktop\\Projects\\Cut-Up-Poems\\src\\Words.svelte"},
            cssId: undefined,
            nonCssHash: undefined,
          })
        : Words;

    /* src\App.svelte generated by Svelte v3.23.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\App.svelte";

    // (40:33) 
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Expand";
    			attr_dev(button, "id", "expand");
    			toggle_class(button, "exp", /*exp*/ ctx[3]);
    			add_location(button, file$1, 40, 2, 1396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*visibility*/ ctx[2])) /*visibility*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*exp*/ 8) {
    				toggle_class(button, "exp", /*exp*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(40:33) ",
    		ctx
    	});

    	return block;
    }

    // (33:1) {#if visibility === "show"}
    function create_if_block(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let textarea;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "To Make a Dadaist Poem";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This is a virtual poetry maker based on Tristan Tzara's instructions! Paste any text below and rearrange to your heart's content.";
    			t3 = space();
    			textarea = element("textarea");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Cut Out";
    			toggle_class(h1, "visibility", /*visibility*/ ctx[2]);
    			add_location(h1, file$1, 34, 2, 966);
    			toggle_class(p, "visibility", /*visibility*/ ctx[2]);
    			add_location(p, file$1, 35, 2, 1018);
    			attr_dev(textarea, "id", "words");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "class", "svelte-pvh4kx");
    			toggle_class(textarea, "visibility", /*visibility*/ ctx[2]);
    			add_location(textarea, file$1, 36, 2, 1175);
    			attr_dev(button, "id", "submitWords");
    			attr_dev(button, "class", "svelte-pvh4kx");
    			toggle_class(button, "visibility", /*visibility*/ ctx[2]);
    			add_location(button, file$1, 37, 2, 1270);
    			attr_dev(div, "id", "chooseWords");
    			attr_dev(div, "class", "svelte-pvh4kx");
    			toggle_class(div, "visibility", /*visibility*/ ctx[2]);
    			add_location(div, file$1, 33, 1, 923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(div, t3);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*wordsStr*/ ctx[1]);
    			append_dev(div, t4);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*getWords*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*visibility*/ 4) {
    				toggle_class(h1, "visibility", /*visibility*/ ctx[2]);
    			}

    			if (dirty & /*visibility*/ 4) {
    				toggle_class(p, "visibility", /*visibility*/ ctx[2]);
    			}

    			if (dirty & /*wordsStr*/ 2) {
    				set_input_value(textarea, /*wordsStr*/ ctx[1]);
    			}

    			if (dirty & /*visibility*/ 4) {
    				toggle_class(textarea, "visibility", /*visibility*/ ctx[2]);
    			}

    			if (dirty & /*visibility*/ 4) {
    				toggle_class(button, "visibility", /*visibility*/ ctx[2]);
    			}

    			if (dirty & /*visibility*/ 4) {
    				toggle_class(div, "visibility", /*visibility*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:1) {#if visibility === \\\"show\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let t;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*visibility*/ ctx[2] === "show") return create_if_block;
    		if (/*visibility*/ ctx[2] === "hide") return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const words_1 = new Words$1({
    			props: { words: /*words*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			t = space();
    			create_component(words_1.$$.fragment);
    			add_location(main, file$1, 31, 0, 884);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t);
    			mount_component(words_1, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t);
    				}
    			}

    			const words_1_changes = {};
    			if (dirty & /*words*/ 1) words_1_changes.words = /*words*/ ctx[0];
    			words_1.$set(words_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(words_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(words_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (if_block) {
    				if_block.d();
    			}

    			destroy_component(words_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function expand() {
    	
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let words = [];

    	let wordsStr = `Take a newspaper.
Take some scissors.
Choose from this paper an article of the length you want to make your poem.
Cut out the article.
Next carefully cut out each of the words that makes up this article and put them all in a bag.
Shake gently.
Next take out each cutting one after the other.
Copy conscientiously in the order in which they left the bag.
The poem will resemble you.
And there you are—an infinitely original author of charming sensibility, even though unappreciated by the vulgar herd.`;

    	let visibility = "show";
    	let exp = "hide";

    	function getWords() {
    		$$invalidate(2, visibility = "hide");
    		$$invalidate(0, words = []);
    		$$invalidate(0, words = wordsStr.replace(/[\s\x0B\x0C\u0085\u2028\u2029]+/g, " "));
    		$$invalidate(0, words = words.split(" "));
    		console.log("getWords");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function textarea_input_handler() {
    		wordsStr = this.value;
    		$$invalidate(1, wordsStr);
    	}

    	$$self.$capture_state = () => ({
    		Words: Words$1,
    		words,
    		wordsStr,
    		visibility,
    		exp,
    		getWords,
    		expand
    	});

    	$$self.$inject_state = $$props => {
    		if ("words" in $$props) $$invalidate(0, words = $$props.words);
    		if ("wordsStr" in $$props) $$invalidate(1, wordsStr = $$props.wordsStr);
    		if ("visibility" in $$props) $$invalidate(2, visibility = $$props.visibility);
    		if ("exp" in $$props) $$invalidate(3, exp = $$props.exp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [words, wordsStr, visibility, exp, getWords, textarea_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }
    var App$1 = App
      = ({ url: (document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href) }) && undefined
        ? applyHmr$1({
            m: ({ url: (document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href) }),
            id: "C:\\Users\\fabyb\\OneDrive\\Desktop\\Projects\\Cut-Up-Poems\\src\\App.svelte",
            hotOptions: {"noPreserveState":false,"noPreserveStateKey":"@!hmr","noReload":false,"optimistic":false,"acceptNamedExports":false,"acceptAccessors":false,"injectCss":true,"cssEjectDelay":100,"hot":true,"noDisableCss":true,"nollup":false},
            Component: App,
            ProxyAdapter: ProxyAdapterDom,
            compileData: {"vars":[{"name":"Words","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"words","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"wordsStr","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"visibility","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"exp","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"getWords","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"expand","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false}],"accessors":false},
            compileOptions: {"dev":true,"css":false,"format":"esm","sveltePath":"svelte","filename":"C:\\Users\\fabyb\\OneDrive\\Desktop\\Projects\\Cut-Up-Poems\\src\\App.svelte"},
            cssId: undefined,
            nonCssHash: undefined,
          })
        : App;

    const app = new App$1({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
