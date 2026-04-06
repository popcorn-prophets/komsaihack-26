'use client';

import { MousePointer2, PencilLine, Trash2 } from 'lucide-react';
import type MapLibreGL from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  type GeoJSONStoreFeatures,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';

import { cn } from '@/lib/utils';

type MapPolygonFeature = GeoJSON.Feature<
  GeoJSON.Polygon,
  GeoJSON.GeoJsonProperties
>;

type MapPolygonDrawMode = 'polygon' | 'select';

type MapPolygonDrawProps = {
  /** Enable or disable polygon drawing instance (default: true) */
  enabled?: boolean;
  /** Active Terra Draw mode (default: "polygon") */
  mode?: MapPolygonDrawMode;
  /** Initial mode when mode is uncontrolled (default: "polygon") */
  defaultMode?: MapPolygonDrawMode;
  /** Called when active draw mode changes */
  onModeChange?: (mode: MapPolygonDrawMode) => void;
  /** Show draw controls on top of the map (default: true) */
  showControls?: boolean;
  /** Show the clear polygons button (default: true) */
  allowClear?: boolean;
  /** Seed polygons. Useful for restoring previously saved boundaries */
  initialFeatures?: MapPolygonFeature[];
  /** Optional adapter options passed to Terra Draw MapLibre adapter */
  adapterOptions?: {
    renderBelowLayerId?: string;
    prefixId?: string;
  };
  /** Called once Terra Draw is initialized and started */
  onReady?: (draw: TerraDraw) => void;
  /** Called whenever polygon features change (create/update/delete/clear) */
  onChange?: (features: MapPolygonFeature[]) => void;
  /** Called when a polygon draw interaction is finished */
  onFinish?: (feature: MapPolygonFeature) => void;
  /** Optional Terra Draw polygon mode options */
  polygonModeOptions?: ConstructorParameters<typeof TerraDrawPolygonMode>[0];
  /** Optional Terra Draw select mode options */
  selectModeOptions?: ConstructorParameters<typeof TerraDrawSelectMode>[0];
};

type MapPolygonDrawPresenterProps = MapPolygonDrawProps & {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

function isPolygonFeature(
  feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
): feature is MapPolygonFeature {
  return feature.geometry.type === 'Polygon';
}

function normalizePolygonFeatures(
  features: MapPolygonFeature[]
): GeoJSONStoreFeatures[] {
  return features.map((feature) => ({
    ...feature,
    properties: {
      ...(feature.properties ?? {}),
      mode: 'polygon',
    },
  })) as GeoJSONStoreFeatures[];
}

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-md border shadow-sm [&>button:not(:last-child)]:border-b">
      {children}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
  className,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        'hover:bg-accent dark:hover:bg-accent/40 flex size-8 items-center justify-center transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}

function MapPolygonDrawPresenter({
  enabled = true,
  mode,
  defaultMode = 'polygon',
  onModeChange,
  showControls = true,
  allowClear = true,
  initialFeatures,
  adapterOptions,
  onReady,
  onChange,
  onFinish,
  polygonModeOptions,
  selectModeOptions,
  map,
  isLoaded,
}: MapPolygonDrawPresenterProps) {
  const isModeControlled = mode !== undefined;
  const [internalMode, setInternalMode] =
    useState<MapPolygonDrawMode>(defaultMode);
  const activeMode = isModeControlled ? mode : internalMode;
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;

  const drawRef = useRef<TerraDraw | null>(null);
  const persistedFeaturesRef = useRef<MapPolygonFeature[]>(
    initialFeatures ?? []
  );

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const onModeChangeRef = useRef(onModeChange);
  onModeChangeRef.current = onModeChange;

  const setActiveMode = useCallback(
    (nextMode: MapPolygonDrawMode) => {
      if (!isModeControlled) {
        setInternalMode(nextMode);
      }
      onModeChangeRef.current?.(nextMode);
    },
    [isModeControlled]
  );

  const handleClear = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;

    draw.clear();
    persistedFeaturesRef.current = [];
    onChangeRef.current?.([]);
  }, []);

  useEffect(() => {
    if (initialFeatures) {
      persistedFeaturesRef.current = initialFeatures;
    }
  }, [initialFeatures]);

  useEffect(() => {
    if (!enabled || !map || !isLoaded) return;

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map,
        ...adapterOptions,
      }),
      modes: [
        new TerraDrawPolygonMode(polygonModeOptions),
        new TerraDrawSelectMode(selectModeOptions),
      ],
    });

    const emitChange = () => {
      const polygons = draw
        .getSnapshot()
        .filter(isPolygonFeature) as MapPolygonFeature[];
      persistedFeaturesRef.current = polygons;
      onChangeRef.current?.(polygons);
    };

    const handleFinish = (id: string | number) => {
      const feature = draw.getSnapshotFeature(id);
      if (!feature || !isPolygonFeature(feature)) return;

      onFinishRef.current?.(feature);
    };

    draw.start();
    drawRef.current = draw;
    draw.setMode(activeModeRef.current);

    if (persistedFeaturesRef.current.length > 0) {
      draw.addFeatures(normalizePolygonFeatures(persistedFeaturesRef.current));
      emitChange();
    }

    draw.on('change', emitChange);
    draw.on('finish', handleFinish);

    onReadyRef.current?.(draw);

    return () => {
      draw.off('change', emitChange);
      draw.off('finish', handleFinish);
      persistedFeaturesRef.current = draw
        .getSnapshot()
        .filter(isPolygonFeature) as MapPolygonFeature[];
      draw.stop();
      drawRef.current = null;
    };
  }, [
    enabled,
    map,
    isLoaded,
    adapterOptions,
    polygonModeOptions,
    selectModeOptions,
  ]);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !enabled) return;
    if (draw.getMode() === activeMode) return;

    draw.setMode(activeMode);
  }, [enabled, activeMode]);

  if (!enabled || !showControls) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 z-10 flex max-w-60 flex-col gap-1.5">
      <ControlGroup>
        <ControlButton
          onClick={() => setActiveMode('polygon')}
          label="Draw polygon"
          className={cn(
            activeMode === 'polygon' &&
              'bg-accent text-accent-foreground dark:bg-accent/60'
          )}
        >
          <PencilLine className="size-4" />
        </ControlButton>
        <ControlButton
          onClick={() => setActiveMode('select')}
          label="Select polygon"
          className={cn(
            activeMode === 'select' &&
              'bg-accent text-accent-foreground dark:bg-accent/60'
          )}
        >
          <MousePointer2 className="size-4" />
        </ControlButton>
      </ControlGroup>

      {allowClear && (
        <ControlGroup>
          <ControlButton onClick={handleClear} label="Clear polygons">
            <Trash2 className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

export {
  MapPolygonDrawPresenter,
  type MapPolygonDrawMode,
  type MapPolygonDrawProps,
  type MapPolygonFeature,
};
