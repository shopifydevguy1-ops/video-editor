-- Seed viral templates for the video editor
INSERT INTO templates (id, name, category, description, config, "isPublic", "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid(),
    'Bold Hook + Fast Captions',
    'viral',
    'High-energy template with big opening hook and word-by-word captions',
    '{
      "captions": {
        "style": "word-by-word",
        "fontFamily": "Arial",
        "fontSize": 64,
        "position": "center",
        "animation": "typewriter",
        "color": "#ffffff",
        "backgroundColor": "#000000"
      },
      "cuts": {
        "frequency": 2,
        "transition": "cut",
        "transitionDuration": 0.1
      },
      "audio": {
        "musicVolume": 0.3,
        "narrationVolume": 1.0,
        "ducking": true,
        "duckingAmount": 0.5
      },
      "visuals": {
        "zoomLevel": 1.1,
        "motion": "slow-zoom",
        "backgroundType": "stock"
      },
      "sceneStructure": {
        "hookDuration": 4,
        "hookStyle": "bold-text",
        "mainContentStyle": "explainer"
      }
    }'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Calm Explainer',
    'explainer',
    'Smooth, professional explainer video template',
    '{
      "captions": {
        "style": "sentence",
        "fontFamily": "Arial",
        "fontSize": 48,
        "position": "bottom",
        "animation": "fade",
        "color": "#ffffff",
        "backgroundColor": "rgba(0,0,0,0.7)"
      },
      "cuts": {
        "frequency": 5,
        "transition": "fade",
        "transitionDuration": 0.5
      },
      "audio": {
        "musicVolume": 0.2,
        "narrationVolume": 1.0,
        "ducking": true,
        "duckingAmount": 0.6
      },
      "visuals": {
        "zoomLevel": 1.0,
        "motion": "static",
        "backgroundType": "stock"
      },
      "sceneStructure": {
        "hookDuration": 3,
        "hookStyle": "question",
        "mainContentStyle": "explainer"
      }
    }'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Before/After Split Screen',
    'viral',
    'Strong contrast template with split screen effect',
    '{
      "captions": {
        "style": "minimal",
        "fontFamily": "Arial",
        "fontSize": 56,
        "position": "center",
        "animation": "fade",
        "color": "#ffffff",
        "backgroundColor": "rgba(0,0,0,0.8)"
      },
      "cuts": {
        "frequency": 3,
        "transition": "wipe",
        "transitionDuration": 0.3
      },
      "audio": {
        "musicVolume": 0.4,
        "narrationVolume": 1.0,
        "ducking": false
      },
      "visuals": {
        "zoomLevel": 1.0,
        "motion": "static",
        "backgroundType": "stock"
      },
      "sceneStructure": {
        "hookDuration": 3,
        "hookStyle": "fast-cuts",
        "mainContentStyle": "story"
      }
    }'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Listicle Countdown',
    'listicle',
    'Numbered list template with countdown animation',
    '{
      "captions": {
        "style": "sentence",
        "fontFamily": "Arial",
        "fontSize": 52,
        "position": "center",
        "animation": "slide",
        "color": "#ffffff",
        "backgroundColor": "rgba(0,0,0,0.7)"
      },
      "cuts": {
        "frequency": 4,
        "transition": "zoom",
        "transitionDuration": 0.4
      },
      "audio": {
        "musicVolume": 0.3,
        "narrationVolume": 1.0,
        "ducking": true,
        "duckingAmount": 0.5
      },
      "visuals": {
        "zoomLevel": 1.15,
        "motion": "ken-burns",
        "backgroundType": "stock"
      },
      "sceneStructure": {
        "hookDuration": 3,
        "hookStyle": "bold-text",
        "mainContentStyle": "list"
      }
    }'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Quote + Cinematic B-Roll',
    'quote',
    'Elegant template with centered quotes and cinematic footage',
    '{
      "captions": {
        "style": "sentence",
        "fontFamily": "Georgia",
        "fontSize": 60,
        "position": "center",
        "animation": "fade",
        "color": "#ffffff",
        "backgroundColor": "rgba(0,0,0,0.6)"
      },
      "cuts": {
        "frequency": 6,
        "transition": "fade",
        "transitionDuration": 0.8
      },
      "audio": {
        "musicVolume": 0.5,
        "narrationVolume": 0.9,
        "ducking": true,
        "duckingAmount": 0.4
      },
      "visuals": {
        "zoomLevel": 1.05,
        "motion": "slow-zoom",
        "backgroundType": "stock"
      },
      "sceneStructure": {
        "hookDuration": 2,
        "hookStyle": "bold-text",
        "mainContentStyle": "story"
      }
    }'::jsonb,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

