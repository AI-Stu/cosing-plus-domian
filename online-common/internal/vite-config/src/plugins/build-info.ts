import type { PluginOption, ResolvedConfig } from 'vite';
import { type Dayjs, type Stats, colors, dateUtil, recursiveDirectory } from '@cosing/node-utils';
import type { BuildInfPluginOptions } from '../types';

function sum(arr: Stats[]): number {
  return arr.reduce((total: number, { size }: Stats) => {
    return total + size;
  }, 0);
}

/**
 * 格式化文件大小
 * @param fileSize
 * @param fixed
 * @returns string
 */
function formatBytes(fileSize: number, fixed?: number): string {
  if (fileSize === 0)
    return '0 B';
  const c = 1024;
  const d = fixed || 2;
  const e = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const f = Math.floor(Math.log(fileSize) / Math.log(c));
  return `${Number.parseFloat((fileSize / c ** f).toFixed(d))} ${e[f]}`;
}

/**
 * vite打包控制台信息
 * @param options
 * @returns PluginOption
 */
export function viteBuildInfoPlugin(options: BuildInfPluginOptions): PluginOption {
  const { configureServerOptions = {}, buildStartOptions = { name: 'Cosing Plus' } } = options;
  let config: ResolvedConfig;
  let startTime: Dayjs;
  let endTime: Dayjs;
  return {
    name: 'vite:buildInfo',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer: {
      order: 'pre',
      handler: (server) => {
        const _printUrls = server.printUrls;
        server.printUrls = () => {
          _printUrls();
          for (const [key, value] of Object.entries(configureServerOptions)) {
            console.log(
              `  ${colors.green('➜')}  ${colors.bold(key)}: ${colors.cyan(value)}`
            );
          }
        };
      }
    },
    buildStart() {
      console.log(
        colors.bold(
          colors.green(
            `👏 欢迎使用${colors.blue(`[${buildStartOptions.name}]`)}，正在为您${config.command === 'build' ? '打包' : '编译'}`
          )
        )
      );
      if (config.command === 'build') {
        startTime = dateUtil(new Date());
      }
    },
    buildEnd() {
      console.log('buildEnd');
    },
    closeBundle() {
      if (config.command === 'build') {
        endTime = dateUtil(new Date());
        recursiveDirectory(config.build.outDir, (fileList: Stats[]) => {
          console.log(
            colors.bold(
              colors.green(
                `恭喜打包完成🎉（总用时${dateUtil
                  .duration(endTime.diff(startTime))
                  .format('mm分ss秒')}，打包后的大小为${formatBytes(sum(fileList))}）`
              )
            )
          );
        });
      }
    }
  };
}
